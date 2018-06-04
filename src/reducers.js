var {
  schema2tree,
  getNode,
  removeNode,
  addNode,
  moveNode,
  updateNode,
} = require('./core');

var undoable = require('redux-undo').default;
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
      name || state[0] && state[0].title || DEFAULT_TREE_NAME,
      schema || state[0].schema,
      uiSchema || state[0].uiSchema
    );
  }
  case 'TREE_ADD_NODE': {
    const {
      schema,
      uiSchema,
      targetNodeKey,
      position
    } = action.paylosd;
    return addNode(
      state,
      targetNodeKey,
      schema,
      uiSchema,
      position
    );
  }
  case 'TREE_REMOVE_NODE':
    return removeNode(state,action.payload);
  case 'TREE_MOVE_NODE':{
    const { source, target, position } = action.payload;
    return moveNode(state, source, target, position);
  }
  case 'TREE_SET_NODE_SCHEMA': {
    const { target, nodeUpdate } = action.payload;
    return updateNode(state, target, nodeUpdate);
  }
  default :
    return state;
  }
}

function activeNodeKey(state=null, action) {
  switch(action.type) {
  case 'ACTIVE_NODE_KEY_SET':
    return action.payload;
  case 'TREE_SET_TREE':
  case 'TREE_CLEAR':
    return null;
  default:
    return state;
  }
}

var reducer = combineReducers({
  tree: undoable(tree),
  activeNodeKey,
});

module.exports = reducer;
