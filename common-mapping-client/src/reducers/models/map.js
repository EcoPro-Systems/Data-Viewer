/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import { mapState as mapStateCore, layerModel as layerModelCore } from "_core/reducers/models/map";

export const mapState = mapStateCore.mergeDeep(
    Immutable.fromJS({
        view: {
            pixelHoverCoordinate: {
                data: [],
                showData: true,
            },
        },
    })
);
