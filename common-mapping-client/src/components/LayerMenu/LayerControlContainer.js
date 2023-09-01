/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { LayerControlContainer as LayerControlContainerCore } from "_core/components/LayerMenu/LayerControlContainer.js";
import { EnhancedSwitch, EnhancedTooltip, LoadingSpinner } from "_core/components/Reusables";
import * as mapActions from "_core/actions/mapActions";
import MiscUtil from "_core/utils/MiscUtil";
import styles from "components/LayerMenu/LayerControlContainer.scss";
import coreStyles from "_core/components/LayerMenu/LayerControlContainer.scss";
import textStyles from "_core/styles/text.scss";
import displayStyles from "_core/styles/display.scss";

export class LayerControlContainer extends LayerControlContainerCore {
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps) {
        // Here we prevent unnecessary renderings by explicitly
        // ignoring certain pieces of the layer state. We do this
        // since LayerControlContainer is passed an entire layer object
        // when instantiated in LayerMenuContainer, which contains state
        // we want to ignore. By ignoring certain things, we can reduce
        // the number of unnecessary renderings.
        let nextLayer = nextProps.layer;
        let currLayer = this.props.layer;
        return (
            LayerControlContainerCore.prototype.shouldComponentUpdate.call(this, nextProps) ||
            nextLayer.get("isLoading") !== currLayer.get("isLoading")
        );
    }
    renderTopContent() {
        return (
            <ListItem dense={true} classes={{ dense: coreStyles.dense }}>
                <EnhancedTooltip
                    title={this.props.layer.get("isActive") ? "Hide Layer" : "Show Layer"}
                    placement="top"
                >
                    <EnhancedSwitch
                        checked={this.props.layer.get("isActive")}
                        onChange={(value, checked) => this.setLayerActive(!checked)}
                        onClick={(evt) => this.setLayerActive(evt.target.checked)}
                    />
                </EnhancedTooltip>
                <span className={textStyles.textEllipsis}>
                    <ListItemText primary={this.props.layer.get("title")} />
                </span>
                <ListItemSecondaryAction>
                    {this.props.layer.get("isLoading") ? (
                        <LoadingSpinner className={styles.loader} />
                    ) : null}
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(LayerControlContainer);
