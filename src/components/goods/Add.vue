<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- Alert警告 -->
      <el-alert
      title="添加商品信息"
      type="info"
      center
      show-icon
      :closable="false">
      </el-alert>
      <!-- Steps步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" style="margin: 15px 0; font-size: 13px;" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <!-- activeIndex 和 name对应   因为name是字符串，所以把activeIndex也变成了字符串-->
      <el-form :model="goodsForm" :rules="goodsFormRules" ref="goodsFormRef">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabsLeave" 
        @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!-- 级联选择器 -->
              <el-cascader
              v-model="selectedCate"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
               <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1" v-for="(item1, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor  v-model="goodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="picDialogVisible"
      width="50%">
      <img :src="picPreview" alt="" class="pic_preview">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      goodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        pics: [],
        goods_cat: '',
        // 商品参数  动态和静态的都要存放在里面
        attrs: [],
        // 商品内容
        goods_introduce: ''
      },
      goodsFormRules: {
        goods_name: [
          {required: true, message: '商品名称不能为空', trigger: 'blur'}
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'}
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ]
      },
      selectedCate: [],
      cateList: [],
      // 级联选择器配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 图片路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      picDialogVisible: false,
      // 图片预览路径
      picPreview: '' 
    }
  },
  created() {
    this.getGoodsList()
  },
  methods:{
    // 选中项发生变化的时候触发
    handleChange() {
      if(this.selectedCate.length != 3) {
        this.selectedCate = []
      }
      console.log(this.selectedCate)
    },
    // 获取商品分类列表
    async getGoodsList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status != 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    // 第一个标签页没有选择商品分类，就阻止标签页切换
     beforeTabsLeave() {
      if(this.activeIndex == '0' && this.selectedCate.length != 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // tab被选中时触发
    async tabClick() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if(this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
        if(res.meta.status != 200) return this.$message.error('获取动态参数失败')

        // 循环attr_vals对象，生成数组
        res.data.forEach((item, index) => {
          if(item.attr_vals.length == 0) {
            item.attr_vals = []
          }else {
            item.attr_vals = item.attr_vals.split(' ')
          }
        })
        this.manyTableData = res.data
      }else if(this.activeIndex === '2') {
        // 证明获取的是静态属性面板
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
        if(res.meta.status != 200) return this.$message.error('获取静态属性失败')
        this.onlyTableData = res.data        
      }
    },
    // 图片预览   就是点击图片名字出现图片
    handlePreview(file) {
      // console.log(file)
      this.picPreview = file.response.data.url
      this.picDialogVisible = true
    },
    // 移除图片触发
    handleRemove(file) {
      // console.log(file)
      // 获取将要删除的图片的临时路径
      var temPath = file.response.data.tmp_path
      for(var i = 0; i < this.goodsForm.pics.length; i++) {
        if(this.goodsForm.pics[i].pic === temPath) {
          this.goodsForm.pics.splice(i, 1)
          // console.log(this.goodsForm)
          break
        }
      }
      
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2.将图片信息对象 push 到pics数组中
      this.goodsForm.pics.push(picInfo)
      // console.log(this.goodsForm)
    },
    // 添加商品
    add() {
      this.$refs.goodsFormRef.validate(async valid => {
        if(!valid) return this.$message.error('请填写必要的表单项')
        // 执行添加的业务逻辑
        // 添加商品中要求商品分类goods_cat是字符串，而在级联选择器中的数据绑定selectedCate要求是数组，而直接把数组变为字符串两者会冲突，所以需要深拷贝
        // 深拷贝 两个对象之间完全脱离关系
        // lodash   cloneDeep(obj)
        this.goodsForm.goods_cat = _.cloneDeep(this.selectedCate)
        this.goodsForm.goods_cat = this.goodsForm.goods_cat.join(',')
        // console.log(this.goodsForm.goods_cat)
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodsForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals 
          }
          this.goodsForm.attrs.push(newInfo)
         
        })
        console.log(this.goodsForm)

        // 添加商品
        const {data: res} = await this.$http.post('goods', this.goodsForm)
        if(res.meta.status != 201) return this.$message.error('添加商品失败')
        this.$router.push('/goods')
        console.log(res)
      })
    }
  },
  computed: {
    // 三级分类id
    cateId() {
      if(this.selectedCate.length === 3) {
        return this.selectedCate[this.selectedCate.length - 1]
      }
      return null
    }
  }
}
</script>
<style lang='less' scoped>
  .pic_preview {
    width: 100%;
  }
  .add {
    margin: 15px 0;
  }
</style>