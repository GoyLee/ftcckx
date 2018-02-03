import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TreeSelect, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
//import { toTreeData } from '../../utils/utils';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
const TreeNode = Tree.TreeNode;

//CreateForm = Form.create()((props) => {
@connect(({party}) => ({
  record: party.record,
  //recordNew: party.recordNew,
  deptTree: party.dept.list,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    //props.onChange(changedFields);
  },
  mapPropsToFields(props) { //绑定字段;
    if(props.record._id) { //不空，是Update，要绑定values和fields。注意判断record对象是否为空对象的方法！不能用record==={}！
      return {
        code: Form.createFormField({ ...props.record.code, value: props.record.code,}),
        username: Form.createFormField({ ...props.record.username, value: props.record.username,}),
        pid: Form.createFormField({ ...props.record.pid, value: props.record.pid,}),
        password: Form.createFormField({ ...props.record.password, value: props.record.password,}),
        type: Form.createFormField({ ...props.record.type, value: props.record.type,}),
        mobile: Form.createFormField({ ...props.record.mobile, value: props.record.mobile,}),
      };
    }
  },
  onValuesChange(_, values) {
    // console.log(values);
  },
})
class PartyForm extends PureComponent {
  state = {
    treeSelectValue: undefined,
  };

  onChange = (value) => {
    this.setState({treeSelectValue: value});
  }
  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.dispatch({
        type: 'party/setRecord',
        payload: fieldsValue, // {
      });
      this.props.handleAdd(fieldsValue);
    });
  };
  
  render(){
    const { record, deptTree, modalVisible, form, handleAdd, handleModalVisible } = this.props;
    return (
      <Modal title="新建用户" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible()}>
        <pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="工号">
          {form.getFieldDecorator('code', {
            initialValue: '120001',
            rules: [{ required: false, message: 'Please input user\'s code...' }],
          })(
            <Input placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
          {form.getFieldDecorator('username', {
            initialValue: 'user',
            rules: [{ required: true, message: 'Please input user\'s name...' }],
          })(
            <Input placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
          {form.getFieldDecorator('password', {
            rules: [{ required: false, message: 'Please input the password...' }],
          })(
            <Input placeholder="请输入"  type='password' />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="从属于">
          {form.getFieldDecorator('pid', {
            rules: [{ required: false, message: 'Please input the super...' }],
          })(
            <TreeSelect allowClear treeNodeFilterProp='label' value={this.state.treeSelectValue} treeDefaultExpandAll treeData={deptTree} showSearch searchPlaceholder='搜索部门' onChange={this.onChange} style={{ width: '100%' }} />
          )}
        </FormItem>      
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类别">
          {form.getFieldDecorator('type',{initialValue: '部门'})( //~defaultValue="部门"
            <Select  style={{ width: '100%' }}>
              <Option value="员工">员工</Option>
              <Option value="部门">部门</Option>
              <Option value="项目">项目</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: false, message: 'Please input user\'s mobile...' }],
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>        
      </Modal>
    ); //options={options} onChange={onChange} 
  }
}

@connect(({ party, loading, }) => ({
  party,
  loading: loading.models.party,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
    recordNew: true, //是否“新增”记录

    expandForm: false,
    formValues: {}, //search conditions from search forms
    collapsed: false,
    selectedRows: [],
    
    //for dept tree
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
    //treeSelectValue: '',
  };
  
  componentDidMount() {
    // eslint-disable-next-line
    // alert(global.currentUser.name);
    const { dispatch } = this.props;
    dispatch({
      type: 'party/fetchDept',
    });

    dispatch({
      type: 'party/fetch',
    });

    //dispatch({ // Myy
    //  type: 'user/changeUserName',
    //  payload: 'Hello World',
    //});
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    
    //dispatch({
    //   type: 'party/fetchDept',
    //});

    dispatch({
      type: 'party/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'party/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'party/remove',
          payload: {
            id: selectedRows.map(row => row._id).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'party/fetch',
        payload: values,
      });
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }
/*
  handleFormChange = (changedFields) => {
    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }
*/
  handleAdd = (fields) => {
    if(this.state.recordNew) { //Create a new record
      this.props.dispatch({
        type: 'party/add',
        payload: fields, // {
          // username: fields.username, //TODO: 试一试仅fields.username是否可以！
          // password: fields.password,
          // type:
        // },
      });
    } else { //Update exist record
      const { party: { record }, loading } = this.props;
      this.props.dispatch({
        type: 'party/update',
        payload: {...record, ...fields}, 
      });    
    }
    this.props.dispatch({
      type: 'party/fetchDept',
    });

    message.success('添加成功:' + JSON.stringify(fields));
    this.setState({
      modalVisible: false,
    });
  }
  onCreate = () => {
    this.props.dispatch({
      type: 'party/setRecord',
      payload: {}, // {
    });
    this.setState({recordNew: true});
    this.handleModalVisible(true);
  }
  onEdit = (record) => {
    this.props.dispatch({
      type: 'party/setRecord',
      payload: record, // {
    });
    this.setState({recordNew: false});
    this.handleModalVisible(true);
  }

  onExpand = (expandedKeys) => {
    //console.log('onExpand', arguments);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys) => {
    //console.log('onCheck', checkedKeys);
    //message.success(checkedKeys);
    this.setState({ checkedKeys });
  }
  onSelect = (selectedKeys, info) => {
    //console.log('onSelect', info);
    // eslint-disable-next-line
    //alert(selectedKeys);
    const params = {
      selectedDept: selectedKeys[0],
    };
    this.props.dispatch({
      type: 'party/fetch',
      payload: params,
    });
    message.success(selectedKeys[0],info);
    this.setState({ selectedKeys });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.label} key={item.value} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  }

  renderDept() {
    const { party: { dept: {list} }, loading } = this.props;
    //var treeData = list.map( (item) => {return {title:item.username, key: item._id,};} );
    //var treeData = toTreeData(list);
    //alert(JSON.stringify(list));
    //checkable
    //message.success("renderDept......");
    return (
      <Tree
        defaultExpandAll={true}
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        loading={loading}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
        onSelect={this.onSelect}
        selectedKeys={this.state.selectedKeys}
      >
        {this.renderTreeNodes(list)}
      </Tree>
    );
  }
  
  render() {
    const { party: { data }, loading } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="组织机构和人员">
        <Layout>
          <Sider width={250} style={{ background: '#fff', margin: 2}}>
            {this.renderDept()}
          </Sider>
          <Content style={{ background: '#fff', margin: 2}}>
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>
                  {this.renderForm()}
                </div>
                <div className={styles.tableListOperator}>
                  <Button icon="plus" type="primary" onClick={() => this.onCreate()}>
                    新建
                  </Button>
                  {
                    selectedRows.length > 0 && (
                      <span>
                        <Button>批量操作</Button>
                        <Dropdown overlay={menu}>
                          <Button>
                            更多操作 <Icon type="down" />
                          </Button>
                        </Dropdown>
                      </span>
                    )
                  }
                </div>
                <StandardTable
                  selectedRows={selectedRows}
                  loading={loading}
                  data={data}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                  onEdit={this.onEdit}
                  />
              </div>
            </Card>
          </Content>
          <PartyForm
            {...parentMethods}
            modalVisible={modalVisible}
          />
        </Layout>
      </PageHeaderLayout>
    );
  }
}
