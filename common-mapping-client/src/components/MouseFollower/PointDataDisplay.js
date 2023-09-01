/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "components/MouseFollower/DataDisplay.scss";

function round(num, prec = 4) {
    return Number(Math.round(num + "e" + prec) + "e-" + prec);
}

export class PointDataDisplay extends Component {
    render() {
        const properties = this.props.data.get("properties");
        const layer = this.props.data.get("layer");
        const color = this.props.data.get("color") || "#000000";
        const displayProps = layer.getIn(["metadata", "hoverDisplayProps"]).toJS();

        return (
            <div className={styles.root}>
                <div className={styles.labelRow}>
                    <div className={styles.color} style={{ backgroundColor: color }} />
                    <Typography variant="body1" className={styles.label}>
                        {properties.get(displayProps.title?.value) || layer.get("title")}
                    </Typography>
                </div>
                {displayProps.altProps.map((p) => {
                    const val = properties.get(p.value);
                    const floatVal = parseFloat(val);
                    return (
                        <Grid key={`prop_${p.value}`} container spacing={0}>
                            <Grid item xs={6}>
                                <Typography variant="caption" className={styles.paramLabel}>
                                    {p.label}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" className={styles.paramValue}>
                                    {!isNaN(floatVal) ? round(floatVal, 3).toString() : val}
                                </Typography>
                            </Grid>
                        </Grid>
                    );
                })}
            </div>
        );
    }
}

PointDataDisplay.propTypes = {
    data: PropTypes.object.isRequired,
};

export default PointDataDisplay;
