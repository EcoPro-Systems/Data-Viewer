/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as actionTypes from "constants/actionTypes";
import { viewState } from "reducers/models/view";
import viewCore from "_core/reducers/view";
import ViewReducer from "reducers/reducerFunctions/ViewReducer";

export default function view(state = viewState, action, opt_reducer = ViewReducer) {
    switch (action.type) {
        case actionTypes.SET_LAYER_MENU_AUTOEXPAND:
            return opt_reducer.setLayerMenuAutoexpand(state, action);
        default:
            return viewCore.call(this, state, action, opt_reducer);
    }
}
