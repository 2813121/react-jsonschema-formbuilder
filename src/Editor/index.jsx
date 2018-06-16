import React from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import JsonEditor from './JsonEditor';
import BasicEditor from './BasicEditor';
import StringEditor from './StringEditor';
import ObjectEditor from './ObjectEditor';

const { getNode } = require('../core');
const { TabPane } = Tabs;



const editorList = [
  StringEditor,
  ObjectEditor,
  BasicEditor,
  JsonEditor
];

class Editor extends React.Component {
  render(){
    const { node, updateNode } = this.props;
    if(!(node && node.schema)) return null;
    return (<Tabs defaultActiveKey={editorList[0].key} onChange={console.log}>
      {editorList.filter(a=>a.filter(node)).map(Editor=>(
        <TabPane tab={Editor.name} key={Editor.key}>
          <div style={{ margin: '0px 16px' }}>
            <Editor
              node={node}
              updateNode={nodeUpdate => updateNode(node.key, nodeUpdate)}
              updateSchema={schemaUpdate => updateNode(node.key, {schema:{...node.schema, ...schemaUpdate}})}
              updateUiSchema={uiSchemaUpdate => updateNode(node.key, {uiSchema: {...node.uiSchema, ...uiSchemaUpdate}})} />
          </div>
        </TabPane>
      ))}
    </Tabs>);
  }
}

export default connect(
  ({tree:{present},activeNodeKey}) => ({
    node: activeNodeKey && getNode(present, activeNodeKey)
  }),
  (dispatch) => ({
    updateNode: (target, nodeUpdate) => dispatch({
      type:'TREE_UPDATE_NODE',
      payload:{
        target,
        nodeUpdate
      }
    })
  })
)(Editor);
