/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import * as mapActions from "_core/actions/mapActions";
import { LayerControlContainer } from "_core/components/LayerMenu";
import { IconButtonSmall, EnhancedTooltip } from "_core/components/Reusables";
import MiscUtil from "_core/utils/MiscUtil";
import stylesCore from "_core/components/LayerMenu/LayerMenuContainer.scss";
import styles from "components/LayerMenu/LayerMenuContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class LayerMenuContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groupOpen: {},
        };
    }

    countActiveInGroup = (group) => {
        let count = 0;
        for (const item of group.items) {
            if (!item.isLeaf) {
                count += this.countActiveInGroup(item);
            } else {
                count += item.layer.get("isActive");
            }
        }
        return count;
    };

    renderLayerGroups = (layerGroups, activeNum, isSub = false) => {
        const { groupOpen } = this.state;
        return (
            <>
                {layerGroups.map((layerGroup) => {
                    const leafNodes = layerGroup.items.filter((item) => item.isLeaf);
                    const subGroups = layerGroup.items.filter((item) => !item.isLeaf);
                    const isOpen = !!groupOpen[layerGroup.label];
                    const groupClass = MiscUtil.generateStringFromSet({
                        [styles.collapseGroup]: true,
                        [styles.collapseSubGroup]: isSub,
                        [styles.open]: isOpen,
                        [styles.closed]: !isOpen,
                    });
                    const iconClass = MiscUtil.generateStringFromSet({
                        [styles.closed]: !isOpen,
                    });

                    const activeLayers = this.countActiveInGroup(layerGroup);
                    return (
                        <div key={`layer_group_${layerGroup.label}`} className={groupClass}>
                            <div
                                className={styles.collapseGroupTitle}
                                onClick={() =>
                                    this.setState({
                                        groupOpen: { ...groupOpen, [layerGroup.label]: !isOpen },
                                    })
                                }
                            >
                                <KeyboardArrowDownIcon className={iconClass} />
                                {layerGroup.label}
                                <Typography variant="caption" className={styles.collapseSubtitle}>
                                    {activeLayers} active
                                </Typography>
                            </div>
                            <div className={styles.collapseGroupItems}>
                                {this.renderLayerGroups(subGroups, activeNum, true)}
                                {this.renderLayerControlList(
                                    leafNodes.map((node) => node.layer),
                                    activeNum
                                )}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    renderLayerControlList = (layerList, activeNum) => {
        const sortedLayers = layerList.sort(MiscUtil.getImmutableObjectSort("title"));
        return (
            <List disablePadding>
                {sortedLayers.map((layer) => (
                    <LayerControlContainer
                        key={layer.get("id") + "_layer_listing"}
                        layer={layer}
                        activeNum={activeNum}
                        palette={this.props.palettes.get(layer.getIn(["palette", "name"]))}
                        className={stylesCore.layerControl}
                    />
                ))}
            </List>
        );
    };

    render() {
        const layerList = this.props.layers.filter((layer) => !layer.get("isDisabled")).toList();

        // group layers together
        const groupedLayers = layerList.reduce(
            (acc, layer) => {
                let groups = layer.get("group");
                if (groups && groups !== appStrings.LAYER_GROUP_NONE) {
                    if (typeof groups.toJS === "function") {
                        groups = groups.toJS();
                    } else if (!Array.isArray(groups)) {
                        groups = [groups];
                    }

                    let insertGroup = acc;
                    groups.forEach((groupStr) => {
                        if (!insertGroup[groupStr]) {
                            insertGroup[groupStr] = { _layers_: [] };
                        }
                        insertGroup = insertGroup[groupStr];
                    });
                    insertGroup._layers_.push(layer);
                } else {
                    acc._layers_.push(layer);
                }
                return acc;
            },
            { _layers_: [] }
        );

        const { _layers_: nonGroupedLayers, ...layerGroups } = groupedLayers;

        const buildTree = (groupObj, nodeKey) => {
            const { _layers_: items, ...subGroups } = groupObj;
            const nodeData = {
                label: nodeKey,
                isLeaf: false,
                items: items
                    ? items.map((layer) => {
                          return {
                              layer,
                              isLeaf: true,
                          };
                      })
                    : [],
            };
            if (subGroups) {
                const keys = Object.keys(subGroups).sort().reverse();
                keys.forEach((groupKey) => {
                    nodeData.items.unshift(buildTree(subGroups[groupKey], groupKey, nodeKey));
                });
            }
            return nodeData;
        };
        const treeList = buildTree(layerGroups, null).items;

        const activeNum = layerList.count((el) => {
            return el.get("isActive");
        });

        // css classes
        const layerMenuClasses = MiscUtil.generateStringFromSet({
            [stylesCore.layerMenu]: true,
            [stylesCore.open]: this.props.layerMenuOpen,
            [displayStyles.hiddenFadeOut]: this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]: !this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        const collapseIconClasses = MiscUtil.generateStringFromSet({
            [stylesCore.expand]: !this.props.layerMenuOpen,
            [stylesCore.collapse]: this.props.layerMenuOpen,
        });

        return (
            <div className={layerMenuClasses}>
                <Paper elevation={1}>
                    <div className={stylesCore.layerHeaderRow}>
                        <div className={stylesCore.layerHeader}>
                            <Typography variant="subtitle1" color="inherit">
                                Map Layers
                            </Typography>
                        </div>
                        <div className="text-right">
                            <EnhancedTooltip
                                title={
                                    this.props.layerMenuOpen
                                        ? "Close layer menu"
                                        : "Open layer menu"
                                }
                                placement="bottom"
                            >
                                <IconButtonSmall
                                    className={collapseIconClasses}
                                    color="default"
                                    onClick={() =>
                                        this.props.setLayerMenuOpen(!this.props.layerMenuOpen)
                                    }
                                >
                                    <KeyboardArrowDownIcon />
                                </IconButtonSmall>
                            </EnhancedTooltip>
                        </div>
                    </div>
                    <Collapse in={this.props.layerMenuOpen} timeout="auto">
                        <div className={stylesCore.layerMenuContent}>
                            {this.renderLayerGroups(treeList, activeNum)}
                            {this.renderLayerControlList(nonGroupedLayers, activeNum)}
                        </div>
                    </Collapse>
                </Paper>
            </div>
        );
    }
}

LayerMenuContainer.propTypes = {
    setLayerMenuOpen: PropTypes.func.isRequired,
    layerMenuOpen: PropTypes.bool.isRequired,
    layers: PropTypes.object.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    palettes: PropTypes.object.isRequired,
    className: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        layerMenuOpen: state.view.get("layerMenuOpen"),
        layers: state.map.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]),
        palettes: state.map.get("palettes"),
        distractionFreeMode: state.view.get("distractionFreeMode"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setLayerMenuOpen: bindActionCreators(mapActions.setLayerMenuOpen, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerMenuContainer);
