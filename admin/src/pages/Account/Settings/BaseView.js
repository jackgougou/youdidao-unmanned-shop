import React, { Component } from 'react';
import { Form, Spin, Card, Button, List, message} from 'antd';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedMessage } from 'umi/locale';
// import HtmlEditor from '@/components/HtmlEditor';
// import htmlparser from 'htmlparser';
import ArticleEditor from '@/components/ArticleEditor';
// import styles from './Info.less';

const FormItem = Form.Item;

@Form.create()
class About extends Component {

  render() {

    const {
      submitting,
    } = this.props;

    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    
    return (
      <Query
        query={gql`
          query{
            config(primaryKey: "about"){
              key
              name
              type
              value
            }
          }
        `}
      >
        {({loading, data: {config}, refetch})=>{
          if (loading) return <Spin />
          
          const listData = [];
          if (config) {
            listData.push({
              title: config.name,
              content: config.value,
            });
          }

          return(
            <Mutation
              mutation={gql`
                mutation(
                  $primaryKey: String,
                  $value: String,
                ){
                  updateConfig(
                    primaryKey: $primaryKey, 
                    value: $value,
                  ){
                    key
                    name
                    type
                    value
                  }
                }
              `}
            >
              {mutate => {
                const updateConfig = {};
                const handleSubmit = e => {
                  const { form } = this.props;
                  if (e) {
                    form.validateFields((err, fieldsValue) => {
                      if (!err) {
                        if (fieldsValue.value) {
                          updateConfig.primaryKey = String('about');
                          updateConfig.value = String(fieldsValue.value);
                          try {
                            const promise = new Promise(resolve => {
                              console.log('updateConfig',updateConfig);
                              
                              resolve(mutate({variables: updateConfig}));
                            });
                            promise.then(value => {
                              console.log(value);
                              message.success('修改成功');
                              refetch();
                            })

                          } catch (catchedError) {
                            //
                          }
                        }
                      };
                    });
                  }
                };
                return(
                  <div>
                    <Card bordered={false}>
                      <Form onSubmit={handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
                        {config ? (
                          <FormItem {...formItemLayout} key={config.key}>
                            {getFieldDecorator('value', {
                              initialValue: config.value,
                              rules: [
                                {
                                  required: true,
                                  message: '请输入',
                                },
                              ],
                            })(<ArticleEditor />)}
                          </FormItem>
                        ) : (
                          ''
                        )}
                        <FormItem {...submitFormLayout} style={{ marginTop: 32, marginRight: 20 }}>
                          <Button type="primary" htmlType="submit" loading={submitting}>
                            <FormattedMessage id="form.submit" />
                          </Button>
                        </FormItem>
                      </Form>
                    </Card>
                    <Card bordered={false}>
                      内容：
                      <List
                        itemLayout="vertical"
                        size="large"
                        dataSource={listData}
                        bordered
                        renderItem={item => <List.Item key={item.title}>{item.content}</List.Item>}
                      />
                    </Card>
                  </div>
                )
              }}
            </Mutation>
          )
        }}
      </Query>
    );
  }
}

export default About;
