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
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import { YearPicker, MonthPicker, DayPicker, IncrementButton } from "_core/components/DatePicker";
import appConfig from "constants/appConfig";
import * as appStringsCore from "_core/constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import * as mapActions from "_core/actions/mapActions";
import containerStyles from "_core/components/DatePicker/DatePickerContainer.scss";
import styles from "_core/components/DatePicker/DatePicker.scss";
import displayStyles from "_core/styles/display.scss";

export class DatePicker extends Component {
    incrementDate(resolution, increment = true) {
        let newDate = moment(this.props.date);
        if (increment) {
            newDate = newDate.add(1, resolution);
        } else {
            newDate = newDate.subtract(1, resolution);
        }

        let minDate = moment(appConfig.MIN_DATE);
        let maxDate = moment(appConfig.MAX_DATE);

        if (newDate.isBetween(minDate, maxDate)) {
            this.props.setDate(newDate.toDate());
        }
    }

    updateDate(resolution, value) {
        // Update the application date based off
        // Autocomplete incomplete date string
        let date = moment(this.props.date);
        let newDate = date.format("YYYY-MMM-DD");
        if (resolution === "days") {
            newDate = date.format("YYYY-MMM") + "-" + value;
        } else if (resolution === "months") {
            newDate = date.format("YYYY") + "-" + value + "-" + date.format("DD");
        } else if (resolution === "years") {
            newDate = value + "-" + date.format("MMM-DD");
        }
        newDate = moment(newDate, "YYYY-MMM-DD", true);

        let minDate = moment(appConfig.MIN_DATE);
        let maxDate = moment(appConfig.MAX_DATE);

        if (newDate.isValid() && newDate.isBetween(minDate, maxDate)) {
            this.props.setDate(newDate.toDate());
        } else {
            this.props.setDate(date.toDate());
        }
    }

    renderYearMonthDay(year, month, day) {
        const containerClasses = MiscUtil.generateStringFromSet({
            [styles.datePicker]: true,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        return (
            <div className={containerClasses}>
                <Grid container spacing={0}>
                    <Grid item xs={5} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years +1"
                            decrement={false}
                            onClick={() => this.incrementDate("years", true)}
                        />
                    </Grid>
                    <Grid item xs={4} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Months +1"
                            decrement={false}
                            onClick={() => this.incrementDate("months", true)}
                        />
                    </Grid>
                    <Grid item xs={3} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Days +1"
                            decrement={false}
                            onClick={() => this.incrementDate("days", true)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={5} className={styles.datePickerSelection}>
                        <YearPicker
                            year={year}
                            onUpdate={(value) => this.updateDate("years", value)}
                        />
                    </Grid>
                    <Grid item xs={4} className={styles.datePickerSelection}>
                        <MonthPicker
                            month={month}
                            onUpdate={(value) => this.updateDate("months", value)}
                        />
                    </Grid>
                    <Grid item xs={3} className={styles.datePickerSelection}>
                        <DayPicker day={day} onUpdate={(value) => this.updateDate("days", value)} />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={5} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years -1"
                            decrement={true}
                            onClick={() => this.incrementDate("years", false)}
                        />
                    </Grid>
                    <Grid item xs={4} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Months -1"
                            decrement={true}
                            onClick={() => this.incrementDate("months", false)}
                        />
                    </Grid>
                    <Grid item xs={3} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Days -1"
                            decrement={true}
                            onClick={() => this.incrementDate("days", false)}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }

    renderYearMonth(year, month) {
        const containerClasses = MiscUtil.generateStringFromSet({
            [styles.datePicker]: true,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        return (
            <div className={containerClasses}>
                <Grid container spacing={0}>
                    <Grid item xs={6} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years +1"
                            decrement={false}
                            onClick={() => this.incrementDate("years", true)}
                        />
                    </Grid>
                    <Grid item xs={6} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Months +1"
                            decrement={false}
                            onClick={() => this.incrementDate("months", true)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={6} className={styles.datePickerSelection}>
                        <YearPicker
                            year={year}
                            onUpdate={(value) => this.updateDate("years", value)}
                        />
                    </Grid>
                    <Grid item xs={6} className={styles.datePickerSelection}>
                        <MonthPicker
                            month={month}
                            onUpdate={(value) => this.updateDate("months", value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={6} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years -1"
                            decrement={true}
                            onClick={() => this.incrementDate("years", false)}
                        />
                    </Grid>
                    <Grid item xs={6} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Months -1"
                            decrement={true}
                            onClick={() => this.incrementDate("months", false)}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }

    renderYear(year) {
        const containerClasses = MiscUtil.generateStringFromSet({
            [styles.datePicker]: true,
            [this.props.className]: typeof this.props.className !== "undefined",
        });

        return (
            <div className={containerClasses}>
                <Grid container spacing={0}>
                    <Grid item xs={12} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years +1"
                            decrement={false}
                            onClick={() => this.incrementDate("years", true)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={12} className={styles.datePickerSelection}>
                        <YearPicker
                            year={year}
                            onUpdate={(value) => this.updateDate("years", value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={0}>
                    <Grid item xs={12} className={styles.incrementButtonWrapper}>
                        <IncrementButton
                            className={styles.incrementButton}
                            aria-label="Years -1"
                            decrement={true}
                            onClick={() => this.incrementDate("years", false)}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }

    render() {
        const date = moment(this.props.date);
        const year = date.format("YYYY");
        const month = date.format("MMM");
        const day = date.format("DD");

        switch (appConfig.DATE_PICKER_RESOLUTION) {
            case appStringsCore.YEARS:
                return this.renderYear(year);
            case appStringsCore.MONTHS:
                return this.renderYearMonth(year, month);
            case appStringsCore.DAYS:
                return this.renderYearMonthDay(year, month, day);
            default:
                return this.renderYearMonthDay(year, month, day);
        }
    }
}

DatePicker.propTypes = {
    setDate: PropTypes.func.isRequired,
    date: PropTypes.object.isRequired,
    className: PropTypes.string,
};

export class DatePickerContainer extends Component {
    render() {
        let containerClasses = MiscUtil.generateStringFromSet({
            [containerStyles.datePickerContainer]: true,
            [displayStyles.hiddenFadeOut]: this.props.distractionFreeMode,
            [displayStyles.hiddenFadeIn]: !this.props.distractionFreeMode,
            [this.props.className]: typeof this.props.className !== "undefined",
        });
        return (
            <div className={containerClasses}>
                <DatePicker date={this.props.date} setDate={this.props.mapActions.setDate} />
            </div>
        );
    }
}

DatePickerContainer.propTypes = {
    date: PropTypes.object.isRequired,
    distractionFreeMode: PropTypes.bool.isRequired,
    mapActions: PropTypes.object.isRequired,
    className: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        date: state.map.get("date"),
        distractionFreeMode: state.view.get("distractionFreeMode"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DatePickerContainer);
