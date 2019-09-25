<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <div style="margin: 15px 0">
        <span>选择商品分类: </span>
        <el-cascader
          v-model="selectedParent"
          :options="cateList"
          :props="cateProps"
          @change="handleChange">
        </el-cascader>
      </div>
      <!-- 标签页 -->
       <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isdisabled" @click="showAddParamsDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(scope.row)"
                @keyup.enter.native="handleInputConfirm(scope.row)"  v-focus
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsForm(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isdisabled" @click="showAddParamsDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(scope.row)"
                @keyup.enter.native="handleInputConfirm(scope.row)"  v-focus
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsForm(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 展示添加参数对话框, 动态和静态公用一个对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form label-width="100px" :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddParamsForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示修改参数对话框 -->
     <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form label-width="100px" :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditParamsForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 数据源
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedParent: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 默认不显示对话框
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数表单验证规则
      addParamsFormRules: {
        attr_name: [
          {required: true, message: '请添加参数名称', trigger: 'blur'}
        ]
      },
      // 默认不显示对话框
      editParamsDialogVisible: false,
      // 双向绑定
      editParamsForm: {
        attr_name: ''
      },
      // 修改参数表单验证规则
      editParamsFormRules: {
        attr_name: [
           {required: true, message: '请添加参数名称', trigger: 'blur'}
        ]
      },
      attr_id: 0,
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods:{
    // 级联选择器选项发生变化的时候触发
    handleChange() {
      this.getParamsData()
    },

    // 获取商品列表数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status != 200) return this.$message.error('获取商品列表失败')
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器切换选项卡时触发
    handleClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      if(this.selectedParent.length != 3) {
        this.selectedParent = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedParent)

      // 根据所选分类的id,和当前所处的面板，获取对应的参数列表数据
      const {data: res} = await this.$http.get(`categories/${this.catId}/attributes`, {params: {sel: this.activeName}})
      if(res.meta.status != 200) return this.$message.error('获取参数列表数据失败')
      console.log(res.data)

      // 将属性渲染成标签
      for(var i = 0; i < res.data.length; i++) {
        res.data[i].inputVisible = false
        res.data[i].inputValue = ''
        // ''.split(' ') => ['']这样是不对的
        if(res.data[i].attr_vals == '') {
          res.data[i].attr_vals = []
        }else {
          res.data[i].attr_vals = res.data[i].attr_vals.split(' ')
        }
      }
      // res.data.forEach(item => {
      //   item.attr_vals = item.attr_vals.split(' ')
      // }) 


      if(this.activeName == 'many') {
        return this.manyTableData = res.data
      }else {
        return this.onlyTableData = res.data
      }
    },
    // 展示添加参数对话框
    showAddParamsDialog() {
      this.addParamsDialogVisible = true
    },
    // 对话框关闭重置表单
    addDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 提交添加参数表单
    submitAddParamsForm() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if(valid == false) return
        const {data: res} = await this.$http.post(`categories/${this.catId}/attributes`, {attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName})
        if(res.meta.status != 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 展示修改参数对话框
    async showEditParamsForm(attr_id) {
      this.attr_id = attr_id
      const {data: res} = await this.$http.get(`categories/${this.catId}/attributes/${attr_id}`,{params: {attr_sel: this.activeName}})
      if(res.meta.status != 200) return this.$message.error('获取参数失败')
      this.editParamsForm.attr_name = res.data.attr_name
      this.editParamsDialogVisible = true

    },
    // 关闭修改对话框， 重置修改表单
    editDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 提交修改表单
    submitEditParamsForm() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put(`categories/${this.catId}/attributes/${this.attr_id}`, {attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName})
        if(res.meta.status != 200) return this.$message.error('更新参数失败')
        this.$message.success('更新参数成功')
        this.editParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 删除参数
    removeParams(attr_id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
       const {data: res} = await this.$http.delete(`categories/${this.catId}/attributes/${attr_id}`)
       if(res.meta.status != 200) return this.$message.error('删除失败')
       this.$message.success('删除成功')
       this.getParamsData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })          
      })
    },
    // 当点击标签的时候显示输入框
    showInput(row) {
      row.inputVisible = true

      // input自动获取焦点
      // 第一种方法
      // $nextTick是当真实的dom,也就是input准备好后执行这个回调函数
      // this.$nextTick(() => {
      //   this.$refs.saveTagInput.$refs.input.focus()
      // })

      // 第二种方法
      // 通过自定义指令，在main.js中写全局都可以使用
    },

    

    async handleInputConfirm(row) {
      if(row.inputValue.trim() == '') {
        row.inputValue = ''
        row.inputVisible = false
        return 
      }
      //
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      // 把修改的数据同步到服务器
      const {data: res} = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {attr_name: row.attr_name, attr_sel: this.activeName, attr_vals: row.attr_vals.join(' ')})
      if(res.meta.status != 200) return this.$message.error('编辑参数失败')
      this.$message.success('编辑参数成功')
    },
    async handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      // 把删除的数据同步到服务器
      const {data: res} = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {attr_name: row.attr_name, attr_sel: this.activeName, attr_vals: row.attr_vals.join(' ')})
      if(res.meta.status != 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
    }
  },
  computed: {
    // 判断是不是三级分类，从而判断按钮的状态
    isdisabled: function() {
      if(this.selectedParent.length === 3) {
        return false
      }else {
        return true
      }
    },
    // 当前选中的三级分类的id
    catId: function() {
      if(this.selectedParent.length === 3) {
        return this.selectedParent[2]
      }
      return null
    },
    titleText: function() {
      if(this.activeName === 'many') {
        return '动态参数'
      }else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang='less' scoped>
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>