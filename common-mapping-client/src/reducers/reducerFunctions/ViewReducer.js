/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import ViewReducerCore from "_core/reducers/reducerFunctions/ViewReducer";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class ViewReducer extends ViewReducerCore {

    static setLayerMenuAutoexpand(state, action) {
        return state.set("layerMenuAutoexpand", action.autoExpand);
    }

}
