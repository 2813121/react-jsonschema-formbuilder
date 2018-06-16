var {
  schema2tree,
  removeNode,
  addNode,
  moveNode,
  updateNode,
  getNodeByRjsfId
} = require('./core');

var undoable = require('redux-undo').default;
var { includeAction } = require('redux-undo');
var { combineReducers } = require('redux');

var DEFAULT_TREE_NAME = 'root';

var s = {
  "title": "A registration form",
  "description": "A simple form example.",
  "type": "object",
  "required": [
    "firstName",
    "lastName"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First name"
    },
    "lastName": {
      "type": "string",
      "title": "Last name"
    },
    "age": {
      "type": "integer",
      "title": "Age"
    },
    "bio": {
      "type": "string",
      "title": "Bio"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "minLength": 3
    },
    "telephone": {
      "type": "string",
      "title": "Telephone",
      "minLength": 10
    }
  }
};
var us = {
  "firstName": {
    "ui:autofocus": true,
    "ui:emptyValue": ""
  },
  "age": {
    "ui:widget": "updown",
    "ui:title": "Age of person",
    "ui:description": "(earthian year)"
  },
  "bio": {
    "ui:widget": "textarea"
  },
  "password": {
    "ui:widget": "password",
    "ui:help": "Hint: Make it strong!"
  },
  "date": {
    "ui:widget": "alt-datetime"
  },
  "telephone": {
    "ui:options": {
      "inputType": "tel"
    }
  }
};

var emptyTree =  schema2tree(
  DEFAULT_TREE_NAME,
  s,
  us
);

function tree(state=emptyTree, action) {
  switch(action.type) {
  case 'TREE_CLEAR':
    return emptyTree;
  case 'TREE_SET_TREE':{
    const {name, schema, uiSchema} = action.payload;
    return schema2tree(
      name || (state[0] && state[0].name) || DEFAULT_TREE_NAME,
      schema || state[0].schema,
      uiSchema || state[0].uiSchema
    );
  }
  case 'TREE_ADD_NODE': {
    const {
      targetNodeKey,
      position,
      node2add
    } = action.payload;
    return addNode(
      state,
      targetNodeKey,
      position,
      node2add
    );
  }
  case 'TREE_REMOVE_NODE':
    return removeNode(state,action.payload);
  case 'TREE_MOVE_NODE':{
    const { source, target, position } = action.payload;
    return moveNode(state, source, target, position);
  }
  case 'TREE_UPDATE_NODE': {
    const { target, nodeUpdate } = action.payload;
    const newState = updateNode(state, target, nodeUpdate);
    console.log(newState);
    return newState;
  }
  default :
    return state;
  }
}

function activeNodeKey(state=null, action) {
  switch(action.type) {
  case 'ACTIVE_NODE_KEY_SET':
    return action.payload || null;
  case 'TREE_UPDATE_NODE':
    const { target, nodeUpdate } = action.payload;
    if(state === target && nodeUpdate.name) {
      const path = state.split('.');
      if (path[path.length-1]!==nodeUpdate.name) {
        return path.slice(0,-1).join('.')+'.'+nodeUpdate.name;
      }
    }
    return state;
  case 'TREE_SET_TREE':
  case 'TREE_CLEAR':
    return null;
  default:
    return state;
  }
}


var defaultSettings = {
  leftSiderWidth: 300,
  rightSiderWidth: 360,
  formWidth: 600,
  isInlineMode: true
};

function settings(state=defaultSettings, action) {
  switch(action.type) {
  case 'SETTINGS_UPDATE':
    return Object.assign({}, state, action.payload);
  default:
    return state;
  }
}


var reducer = combineReducers({
  tree: undoable(tree,{
    filter: includeAction([
      'TREE_UPDATE_NODE',
      'TREE_SET_TREE',
      'TREE_CLEAR',
      'TREE_ADD_NODE',
      'TREE_REMOVE_NODE',
      'TREE_MOVE_NODE'
    ]),
  }),
  activeNodeKey,
  settings,
});

module.exports = function (state, action) {
  switch(action.type) {
  case 'TREE_REMOVE_NODE_BY_RJSF_ID': {
    const target = getNodeByRjsfId(state.tree.present, action.payload);
    if(!target) return state;
    action = {
      type: 'TREE_REMOVE_NODE',
      payload: target.key
    };
    break;
  }
  case 'ACTIVE_NODE_KEY_SET_BY_RJSF_ID': {
    const target = getNodeByRjsfId(state.tree.present, action.payload);
    if(!target) return state;
    action = {
      type: 'ACTIVE_NODE_KEY_SET',
      payload: target.key
    };
    break;
  }
  case 'TREE_UPDATE_NODE_BY_RJSF_ID': {
    const { rjsfId } = action.payload;
    const target = getNodeByRjsfId(state.tree.present, rjsfId);
    if(!target) return state;
    action = {
      type: 'TREE_UPDATE_NODE',
      payload: Object.assign(
        {}, action.payload, {target: target.key}
      )
    };
    break;
  }
  default:
    break;
  }
  return reducer(state, action);
};
