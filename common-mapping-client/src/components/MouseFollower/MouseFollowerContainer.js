/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Immutable from "immutable";
import MiscUtil from "_core/utils/MiscUtil";
import {
    MouseCoordinates as MouseCoordinatesCore,
    DrawingTooltip,
} from "_core/components/MouseFollower";
import { DataDisplayContainer } from "components/MouseFollower";
import styles from "components/MouseFollower/MouseFollowerContainer.scss";
import stylesCore from "_core/components/MouseFollower/MouseFollowerContainer.scss";
import displayStyles from "_core/styles/display.scss";

export class MouseFollowerContainer extends Component {
    shouldComponentUpdate(nextProps) {
        let nextDraworMeasure =
            nextProps.drawing.get("isDrawingEnabled") ||
            nextProps.measuring.get("isMeasuringEnabled");
        let currDrawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");

        let currShowData =
            this.props.pixelCoordinate.get("isValid") &&
            this.props.pixelCoordinate.get("showVectorData");
        let nextShowData =
            nextProps.pixelCoordinate.get("isValid") &&
            nextProps.pixelCoordinate.get("showVectorData");

        return (
            nextDraworMeasure ||
            nextDraworMeasure !== currDrawOrMeasure ||
            nextShowData ||
            nextShowData !== currShowData
        );
    }

    renderCoordinates(data) {
        if (data.size > 0) {
            return "";
        } else {
            return <MouseCoordinatesCore />;
        }
    }

    render() {
        const maxLeft = window.innerWidth - 300;
        const maxTop = window.innerHeight;

        const top = parseInt(this.props.pixelCoordinate.get("y"));
        const left = parseInt(this.props.pixelCoordinate.get("x"));

        const style = { top, left };

        const drawOrMeasure =
            this.props.drawing.get("isDrawingEnabled") ||
            this.props.measuring.get("isMeasuringEnabled");

        const vectorData = this.props.pixelCoordinate.getIn(["data", "vector"]) || Immutable.List();
        let dataAvailable = vectorData.size > 0;

        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.root]: true,
            [stylesCore.mouseFollowerContainer]: true,
            [stylesCore.active]:
                this.props.pixelCoordinate.get("isValid") &&
                (this.props.pixelCoordinate.get("showVectorData") || drawOrMeasure),
            [stylesCore.right]: left > maxLeft,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        let drawClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]: !drawOrMeasure,
        });

        let dataClasses = MiscUtil.generateStringFromSet({
            [displayStyles.hidden]:
                !this.props.pixelCoordinate.get("showVectorData") || drawOrMeasure,
        });

        return (
            <div className={containerClasses} style={style}>
                <div className={stylesCore.content}>
                    <DrawingTooltip
                        drawing={this.props.drawing}
                        measuring={this.props.measuring}
                        className={drawClasses}
                    />
                    <DataDisplayContainer className={dataClasses} data={vectorData} />
                </div>
                <div className={stylesCore.footer}>{this.renderCoordinates(vectorData)}</div>
            </div>
        );
    }
}

MouseFollowerContainer.propTypes = {
    pixelCoordinate: PropTypes.object.isRequired,
    drawing: PropTypes.object.isRequired,
    measuring: PropTypes.object.isRequired,
    className: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        pixelCoordinate: state.map.getIn(["view", "pixelHoverCoordinate"]),
        drawing: state.map.get("drawing"),
        measuring: state.map.get("measuring"),
    };
}

export default connect(mapStateToProps, null)(MouseFollowerContainer);
