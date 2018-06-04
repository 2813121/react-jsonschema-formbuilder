const {
  schema2tree,
  removeNodeByPath,
  addNodeByPath,
  moveNodeByPath,
  updateNodeByPath,
} = require('./core');
describe('core functions',function () {
  describe('Remove tree node', function() {
    function r(before, after, key) {
      const treeBefore = schema2tree(
        'root',
        before.schema,
        before.uiSchema
      );
      const treeAfter = removeNodeByPath(
        treeBefore,
        key.split('.')
      );
      const expectedTreeAfter = schema2tree(
        'root',
        after.schema,
        after.uiSchema,
      );
      expect(treeAfter).toEqual(expectedTreeAfter);
    }

    it('remove object item properties', () => {
      const before= {
        schema: {
          type:'object',
          properties: {
            foo:{type:'string'},
            bar:{type:'number'}
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'}
        }
      };
      const after = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'number'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'}
        }
      };
      r(before,after,'root.foo');
    });
    it('remove nested item', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            foo:{
              type:'object',
              properties: {
                bar: {type:'string'}
              }
            }
          }
        },
        uiSchema:{
          foo:{
            'ui:foo':'foo',
            bar:{
              'ui:bar':'bar'
            }
          }
        }
      };
      const after1 = {
        schema: {
          type:'object',
          properties: {
            foo:{
              type:'object',
              properties: {
              }
            }
          }
        },
        uiSchema:{
          foo:{
            'ui:foo':'foo'
          }
        }
      };
      const after2 = {
        schema: {
          type:'object',
          properties: {
          }
        },
      };
      r(before,after1,'root.foo.bar');
      r(before,after2,'root.foo');
    });
    it('remove array array items', () => {
      const before= {
        schema: {
          type:'array',
          items: [
            {type:'string'},
            {type:'number'}
          ]
        },
        uiSchema: {
          items:[
            {'ui:0':'0'},
            {'ui:1':'1'}
          ]
        }
      };
      const after = {
        schema:{
          type:'array',
          items: [
            {type:'number'}
          ]
        },
        uiSchema: {
          items:[
            {'ui:1':'1'}
          ]
        }
      };
      r(before,after,'root.[items].0');
    });
    it('remove array additional items', () => {
      const before= {
        schema: {
          type:'array',
          items: [
            {type:'string'},
            {type:'number'}
          ],
          additionalItems: {
            type:'string'
          }
        },
        uiSchema: {
          'ui:root': 'root',
          additionalItems: {
            'ui:a':'a'
          }
        }
      };
      const after = {
        schema:{
          type:'array',
          items: [
            {type:'string'},
            {type:'number'}
          ]
        },
        uiSchema: {
          'ui:root': 'root',
        }
      };
      r(before,after, 'root.additionalItems');
    });
    it('remove array items properties', () => {
      const before= {
        schema: {
          type:'array',
          items: [{
            type:'object',
            properties: {
              foo:{type:'string'},
              bar:{type:'string'}
            }
          },{type:'number'}],
          additionalItems: {
            type:'string'
          }
        },
        uiSchema: {
          'ui:root':'root',
          items:[{
            foo:{
              'ui:foo':'foo'
            }
          }]
        }
      };
      const after = {
        schema: {
          type:'array',
          items: [{
            type:'object',
            properties: {
              bar:{type:'string'}
            }
          },{type:'number'}],
          additionalItems: {
            type:'string'
          }
        },
        uiSchema: {
          'ui:root':'root'
        }
      };
      r(before,after,'root.[items].0.foo');
    });
    it('remove array object item', () => {
      const before= {
        schema: {
          type:'array',
          items: {
            type:'object',
            properties: {
              foo:{type:'string'},
              bar:{type:'string'}
            }
          }
        }
      };
      const after = {
        schema: {
          type:'array',
          items: {
            type:'object',
            properties: {
              bar:{type:'string'}
            }
          }
        }
      };
      r(before,after,'root.items.foo');
    });
  });
  describe('add tree node', function() {
    function r(before, after, key, position, add, name) {
      const treeBefore = schema2tree(
        'root',
        before.schema,
        before.uiSchema
      );
      const nodeAdd = schema2tree(
        name,
        add.schema,
        add.uiSchema
      )[0];
      const treeAfter = addNodeByPath(
        treeBefore,
        key.split('.'),
        position,
        nodeAdd
      );
      const expectedTreeAfter = schema2tree(
        'root',
        after.schema,
        after.uiSchema,
      );
      expect(treeAfter).toEqual(expectedTreeAfter);
    }
    it('add object item properties', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'number'},
            baz:{type:'boolean'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'}
        }
      };
      const toadd = {
        schema:{type:'string'},
        uiSchema:{'ui:foo':'foo'}
      };
      const addBeforeAfter = {
        schema: {
          type:'object',
          properties: {
            foo:{type:'string'},
            bar:{type:'number'},
            baz:{type:'boolean'}
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'}
        }
      };
      const addAfterAfter = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'number'},
            foo:{type:'string'},
            baz:{type:'boolean'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'},
          foo:{'ui:foo':'foo'}
        }
      };
      r(before,addBeforeAfter,'root.bar',-1,toadd,'foo');
      r(before,addAfterAfter,'root.bar',1,toadd,'foo');
    });

    it('add object properties', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'object'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'}
        }
      };
      const toadd = {
        schema:{type:'string'},
        uiSchema:{'ui:foo':'foo'}
      };
      const after = {
        schema: {
          type:'object',
          properties: {
            bar:{
              type:'object',
              properties:{
                foo:{type:'string'},
              }
            }
          }
        },
        uiSchema: {
          bar:{
            'ui:bar':'bar',
            foo:{'ui:foo':'foo'},
          }
        }
      };
      r(before,after,'root.bar',0,toadd,'foo');
    });

    it('add properties in nested object', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'object'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'}
        }
      };
      const toadd = {
        schema:{type:'string'},
        uiSchema:{'ui:foo':'foo'}
      };
      const after = {
        schema: {
          type:'object',
          properties: {

            bar:{
              type:'object',
              properties:{
                foo:{type:'string'},
              }
            }
          }
        },
        uiSchema: {
          bar:{
            'ui:bar':'bar',
            foo:{'ui:foo':'foo'},
          }
        }
      };
      r(before,after,'root.bar',0,toadd,'foo');
    });
    it('add array items', () => {
      const before = {
        schema: {
          type:'array',
          items: [
            {type:'string'}
          ]
        },
        uiSchema: {
          items:[
            {'ui:bar':'bar'}
          ]
        }
      };
      const toadd = {
        schema:{type:'number'},
        uiSchema:{'ui:foo':'foo'}
      };
      const addBeforeAfter = {
        schema: {
          type:'array',
          items: [
            {type:'number'},
            {type:'string'}
          ]
        },
        uiSchema: {
          items:[
            {'ui:foo':'foo'},
            {'ui:bar':'bar'}
          ]
        }
      };
      const addAfterAfter = {
        schema: {
          type:'array',
          items: [
            {type:'string'},
            {type:'number'}
          ]
        },
        uiSchema: {
          items:[
            {'ui:bar':'bar'},
            {'ui:foo':'foo'}
          ]
        }
      };
      r(before,addBeforeAfter,'root.[items].0',-1,toadd,'foo');
      r(before,addAfterAfter,'root.[items].0',1,toadd,'foo');
    });
  });
  describe('Move tree node', function() {
    function r(before, after, source, target, position) {
      const treeBefore = schema2tree(
        'root',
        before.schema,
        before.uiSchema
      );
      const treeAfter = moveNodeByPath(
        treeBefore,
        source.split('.'),
        target.split('.'),
        position
      );
      const expectedTreeAfter = schema2tree(
        'root',
        after.schema,
        after.uiSchema,
      );
      expect(treeAfter).toEqual(expectedTreeAfter);
    }
    it('reorder properties', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            foo:{type:'number'},
            bar:{type:'string'},
            baz:{type:'boolean'},
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'},
          baz:{'ui:baz':'baz'},
        }
      };
      const moveForwardAfter = {
        schema: {
          type:'object',
          properties: {
            foo:{type:'number'},
            baz:{type:'boolean'},
            bar:{type:'string'},
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'},
          baz:{'ui:baz':'baz'},
        }
      };
      const moveBackwardAfter = {
        schema: {
          type:'object',
          properties: {
            bar:{type:'string'},
            foo:{type:'number'},
            baz:{type:'boolean'},
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'},
          baz:{'ui:baz':'baz'},
        }
      };
      r(before,moveForwardAfter,'root.baz','root.foo',1);
      r(before,moveForwardAfter,'root.baz','root.bar',-1);
      r(before,moveBackwardAfter,'root.foo','root.bar',1);
      r(before,moveBackwardAfter,'root.foo','root.baz',-1);
    });
    it('move properties between objects', () => {
      const before = {
        schema: {
          type:'object',
          properties: {
            foo:{
              type:'object',
              properties: {
                foofoo:{type:'string'},
              }
            },
            bar:{type:'string'}
          }
        },
        uiSchema: {
          foo:{
            'ui:foo':'foo',
            foofoo: {'ui:foofoo':'foofoo'},
          },
          bar:{'ui:bar':'bar'},
        }
      };
      const moveInAfter = {
        schema: {
          type:'object',
          properties: {
            foo:{
              type:'object',
              properties: {
                foofoo:{type:'string'},
                bar:{type:'string'}
              }
            }
          }
        },
        uiSchema: {
          foo:{
            'ui:foo':'foo',
            foofoo: {'ui:foofoo':'foofoo'},
            bar:{'ui:bar':'bar'},
          }
        }
      };
      const moveOutAfter = {
        schema: {
          type:'object',
          properties: {
            foo:{
              type:'object',
              properties: {
              }
            },
            bar:{type:'string'},
            foofoo:{type:'string'},

          }
        },
        uiSchema: {
          foo:{
            'ui:foo':'foo',
          },
          bar:{'ui:bar':'bar'},
          foofoo: {'ui:foofoo':'foofoo'},
        }
      };
      r(before,moveInAfter,'root.bar','root.foo.foofoo',1);
      r(before,moveOutAfter,'root.foo.foofoo','root.bar',2);
    });
    it('move array items within array', () => {
      const before = {
        schema:{
          type: 'array',
          items: [
            {title:'foo',type:'string'},
            {title:'bar',type:'number'},
            {title:'baz',type:'boolean'},
          ]
        },
        uiSchema:{
          items: [
            {'ui:foo':'foo'},
            {'ui:bar':'bar'},
            {'ui:baz':'baz'},
          ]
        }
      };
      const moveForwardAfter = {
        schema:{
          type: 'array',
          items: [
            {title:'foo',type:'string'},
            {title:'baz',type:'boolean'},
            {title:'bar',type:'number'},
          ]
        },
        uiSchema:{
          items: [
            {'ui:foo':'foo'},
            {'ui:baz':'baz'},
            {'ui:bar':'bar'},
          ]
        }
      };
      const moveBackwardAfter = {
        schema:{
          type: 'array',
          items: [
            {title:'bar',type:'number'},
            {title:'foo',type:'string'},
            {title:'baz',type:'boolean'},
          ]
        },
        uiSchema:{
          items: [
            {'ui:bar':'bar'},
            {'ui:foo':'foo'},
            {'ui:baz':'baz'},
          ]
        }
      };
      r(before,moveForwardAfter,'root.[items].2','root.[items].0',1);
      r(before,moveForwardAfter,'root.[items].2','root.[items].1',-1);
      r(before,moveBackwardAfter,'root.[items].0','root.[items].1',1);
      r(before,moveBackwardAfter,'root.[items].0','root.[items].2',-1);
    });
    it('should not change if try to move to leaf',function () {
      const data = {
        schema: {
          type:'object',
          properties: {
            foo:{type:'number'},
            bar:{type:'string'},
            baz:{type:'boolean'},
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'},
          baz:{'ui:baz':'baz'},
        }
      };
      const tree = schema2tree('root', data.schema, data.uiSchema);
      const newTree = moveNodeByPath(tree, 'root.bar'.split('.'),'root.foo'.split('.'),0);
      expect(newTree).toBe(tree);
    });
  });
  describe('Set tree node schema', function() {
    function r(before, after, key, nodeUpdate) {
      const treeBefore = schema2tree(
        'root',
        before.schema,
        before.uiSchema
      );
      const treeAfter = updateNodeByPath(
        treeBefore,
        key.split('.'),
        nodeUpdate
      );
      const expectedTreeAfter = schema2tree(
        'root',
        after.schema,
        after.uiSchema,
      );
      expect(treeAfter).toEqual(expectedTreeAfter);
    }
    it('update schema', function () {
      const before = {
        schema: {
          type:'object',
          properties:{
            foo:{type:'string'},
            bar:{type:'number'}
          }
        },
        uiSchema: {
          foo:{'ui:foo':'foo'},
          bar:{'ui:bar':'bar'}
        }
      };
      const after = {
        schema: {
          type:'object',
          properties:{
            foofoo:{type:'string', title:'Foo'},
            bar:{type:'number'}
          }
        },
        uiSchema: {
          bar:{'ui:bar':'bar'}
        }
      };
      r(before,after,'root.foo',{schema:{title:'Foo'},uiSchema:{},title:'foofoo'});
    });
  });
});
