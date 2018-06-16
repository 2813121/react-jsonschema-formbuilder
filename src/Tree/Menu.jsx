import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Button, Icon } from 'antd';
const { SubMenu, Item } = Menu;

const { schema2node } = require('../core');

const basic = {
  schema: {
    type:'object',
    title:'Basic',
    properties: {
      object: {type:'object', title:'Object'},
      text: {type:'string', title:'Text'},
      checkbox: {type:'boolean', title:'Checkbox'},
      dropdown: {
        type:'string',
        title: 'Dropdown',
        enum: ['option-1','option-2','option-3'],
        enumNames: ['Option 1', 'Option 2', 'Option 3']
      },
      number: {type:'number', title:'Number'},
      textarea: {type:'string', title:'Text Area'},
      datetime: {type:'string', title: 'Date Time'},
      multiChoices: {
        "type": "array",
        "title": "Multiple Choices",
        "items": {
          "type": "string",
          "enum": [
            "option-1",
            "option-2",
            "option-3",
          ]
        },
        "uniqueItems": true
      }

    }
  },
  uiSchema: {
    textarea: { 'ui:widget': 'textarea' },
    datetime: { 'ui:widget': 'datetime' },
    multiChoices: {
      "ui:widget": "checkboxes"
    }
  }
}

const menu = schema2node([],{
  type:'object',
  properties: {
    basic: basic.schema
  }
}, {
  basic: basic.uiSchema
}).children;

function nameGen(name, occupied) {
  let n = 1;
  let newName = name;
  while (occupied && occupied.includes(newName)) {
    newName = name + '_' + n;
    n+=1;
  }
  return newName;
}


class AddItemMenu extends React.Component {
  state = {
    collapsed: false,
  }
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  onAddNode = (node2add)=>{
    const { node, addNode } = this.props;
    const name = nameGen(
      node2add.name,
      this.props.node.children.map(a=>a.name)
    );
    addNode({...node2add, name});
  }
  render() {
    const menuTree = menu;
    return (
      <Menu
        mode="inline"
        theme="dark"
        defaultOpenKeys={['basic']}
      >
        {menuTree.map(a=>(
          <SubMenu key={a.key} title={a.schema.title || a.name}>
            {a.children.map(b=>(
              <Item key={b.key} onClick={()=>this.onAddNode(b)}>
                {b.schema.title || b.name}
              </Item>
            ))}
          </SubMenu>
        ))}
      </Menu>
    );
  }
}

export default connect(
  null,
  (dispatch, {node}) => ({
    addNode: node2add => dispatch({
      type: 'TREE_ADD_NODE',
      payload: {
        targetNodeKey: node.key,
        position: 0,
        node2add,
      }
    })
  })
)(AddItemMenu);
