/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import Immutable from "immutable";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MapContainer2D as MapContainer2DCore } from "_core/components/Map/MapContainer2D.js";
import { setLayerLoading } from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as appStringsCore from "_core/constants/appStrings";

export class MapContainer2D extends MapContainer2DCore {
    initializeMapListeners() {
        MapContainer2DCore.prototype.initializeMapListeners.call(this);

        let map = this.props.maps.get(appStringsCore.MAP_LIB_2D);
        if (typeof map !== "undefined") {
            // add layer load callback
            map.setLayerLoadCallback((options) => {
                const { layer, loading, error } = options;
                this.props.setLayerLoading(layer, loading);
            });
        } else {
            console.error("Cannot initialize event listeners: 2D MAP NOT AVAILABLE");
        }
    }
}

MapContainer2D.propTypes = Immutable.Map(MapContainer2DCore.propTypes)
    .merge({
        setLayerLoading: PropTypes.func.isRequired,
    })
    .toJS();

function mapStateToProps(state) {
    return {
        maps: state.map.get("maps"),
        units: state.map.getIn(["displaySettings", "selectedScaleUnits"]),
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        initialLoadComplete: state.view.get("initialLoadComplete"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        mapActions: bindActionCreators(mapActionsCore, dispatch),
        setLayerLoading: bindActionCreators(setLayerLoading, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer2D);
