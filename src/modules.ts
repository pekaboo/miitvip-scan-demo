import { App } from 'vue'
import 'ant-design-vue/lib/message/style/index.less'
import 'ant-design-vue/lib/modal/style/index.less'
import 'ant-design-vue/lib/button/style/index.less'
import 'ant-design-vue/lib/select/style/index.less'
import { message, Modal, Button,Select } from 'ant-design-vue'

const components = { message, Modal, Button ,Select } as any
const antd = {
    install(app: App) {
        app.config.globalProperties.$message = message
        Object.keys(components).forEach((name) => {
            app.use(components[name])
        })
    }
}
export default antd