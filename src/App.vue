<template>
    <!-- <a href="https://www.makeit.vip" target="_blank"><img class="logo" alt="Makeit Vip logo" src="https://file.makeit.vip/MIIT/M00/00/00/ajRkHV_pUyOALE2LAAAtlj6Tt_s370.png" /></a> -->
    <video class="video" id="video" ref="video" autoplay  ></video>
    <div class="photograph"  >
        <a-button type="danger" size="large">拍照 - 扫描解析二维码 / 条形码</a-button>
        <input class="file" type="file" ref="camera" capture="camera" accept="image/*" @change="change" />
        <img id="preview" alt="preview" v-if="preview" />
    </div>
    <a-modal v-model:visible="modalVisible" centered title="温馨提示：扫描解析成功" okText="刷新后再次进行识别操作" cancelText="关闭" @ok="reload" @cancel="cancel">
        <p>扫描结果：<a :href="content" target="_blank">{{ content }}</a></p>
        <p>扫描时间：{{ time }}</p>
    </a-modal>
 <!-- :default-value="device.label" -->
    <a-select v-model="value"  style="padding-top:25px;width: 100%;font-size:60%"   placeholder="请选择" @change="handleChange">
        <a-select-option v-for="(item,idx ) in devices" :value="idx" :key="item.deviceId">{{ item.label }}</a-select-option>
        </a-select> 
        <div>
            <div style="font-weight:bold;color:green;padding-top:20px;font-sise:60%;   white-space:normal;
         word-break:break-all;
         word-wrap:break-word; ">当前设备<br>{{  device}}</div>
        <div style="font-weight:bold;color:blue;padding-top:20px;font-sise:60%;   white-space:normal;
         word-break:break-all;
         word-wrap:break-word; ">所有设备<br>{{JSON.stringify(devices)}}</div>
        </div> 
</template>

<script lang="ts">
    import { defineComponent, ref, reactive  } from 'vue'
    import { BrowserMultiFormatReader } from '@zxing/library' 


    export default defineComponent({
        
        setup() {
            const iphone = ref(false)
            const errMsg = ref('')
            const time = ref(null)
            const devices = ref(null)
            const device = ref(null)
            const content = ref(null)
            const preview = ref(false)
            const modalVisible = ref(false)
            const reader = new BrowserMultiFormatReader()
            return {iphone, errMsg, time, content,devices,device, preview, modalVisible, reader}
        },

        methods: {
            async openCamera() {
                this.$message.success({
                    content: '正在尝试拉起摄像头 ...',
                    duration: 0
                })
                console.log(navigator.mediaDevices);
                
                if (!navigator.mediaDevices) { //是Iphone
                    this.$message.destroy()
                    this.iphone = true
                    this.$message.success({
                        content: 'iPhone 其它浏览器无权限自动开启摄像头 ...',
                        duration: 0
                    })
                } else {//其他
                  // this.reader.listVideoInputDevices().then(async (videoInputDevices) => {}).catch((err) => {})
                    this.reader.listVideoInputDevices().then((devices) => { //获取摄像头列表
                        devices.push({"deviceId":"135e9f6928e41d6c7f8afc0af19f6fd224186f9af9623e79dafe8236bbf7e02c","label":"Integrated Camera (5986:2113)","kind":"videoinput","groupId":"c3c25df9b578fc13ed99aba2c718e278895bb286808fff8ec33c6c9b1748126c"})
                        this.devices = devices
                        if (devices.length <= 0) {
                            this.$message.destroy();
                            this.$message.warning({
                                content: '当前没有可用的摄像头设备 ...',
                                duration: 0
                            })
                        } else {
                            var device =parseInt(localStorage.getItem("device")) ;
                            console.log(device);
                            
                            if(device>=0){
                               //did 在devices 里面
                               if(devices.length<device+1){
                                      device =  0
                               } 
                                this.device =  devices[device].deviceId;
                               
                                this.decode(devices[device].deviceId)
                                return;
                            }
                            
                            let id = devices[0].deviceId
                            for (let i = 0; i < devices.length; i++) {
                                if (
                                    devices[i].label.indexOf('back') !== -1 ||
                                    devices[i].label.indexOf('RGB') !== -1
                                ) {
                                    id = devices[i].deviceId 
                                    this.device =  i;
                                    break
                                }
                            }
                            this.decode(id)
                        }
                    }).catch((err) => {
                        this.errMsg = err
                        this.$message.destroy()
                        this.$message.error({
                            content: err,
                            duration: 0
                        })
                    })
                }
            },

            
            decode(id: any) {
                // alert(id)
                this.reader.reset()
                this.$message.destroy()
                this.$message.success({
                    content: '正在尝试识别，请对准摄像头 ...',
                    duration: 0
                })
                this.reader.decodeOnceFromVideoDevice(id, 'video').then((res) => {
                    this.$message.destroy()
                    this.content = res.text
                    this.time = new Date(res.timestamp)
                    this.modalVisible = true
                }).catch((err) => {
                    this.$message.destroy()
                    this.$message.error({
                        content: '识别失败，请刷新后再次尝试 ...',
                        duration: 0
                    })
                    this.errMsg = err
                })
            },

            decodeFromImage() {
                const image = document.getElementById('preview') as HTMLImageElement
                this.reader.decodeFromImage(image).then((res) => {
                    this.$message.destroy()
                    this.content = res.text
                    this.time = new Date(res.timestamp)
                    this.modalVisible = true
                }).catch((err) => {
                    this.$message.destroy()
                    this.$message.error({
                        content: '识别失败，请刷新后再试',
                        duration: 0
                    })
                    this.errMsg = err
                })
            },

            change() {
                const vm = this
                vm.$message.success({
                    content: '正在识别图片，请稍候 ...',
                    duration: 0
                })
                const files = (this.$refs.camera as any).files
                const file = files[files.length - 1]
                const reader = new FileReader()
                reader.onload = (e: any) => {
                    this.preview = true
                    vm.$nextTick(() => {
                        const image = document.getElementById('preview') as HTMLInputElement
                        if (image) image.src = e.target.result
                        this.decodeFromImage()
                    })
                }
                reader.readAsDataURL(file)
            },

            handleChange(value) {
               console.log("你选择了:" + value);
               localStorage.setItem("device",JSON.stringify(value));
               window.location.reload()
            },
            reload() {
                window.location.reload()
            },

            cancel() {
                // this.$message.success({
                //     content: '上次扫描解析成功，请刷新后再次尝试识别 ...',
                //     duration: 0
                // })
                this.modalVisible = false;
                this.decode(this.device)
            }
        },

        mounted() {this.openCamera()}
    })
</script>