<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 表格 -->
      <el-button type="primary" @click="showAddCateDialog" class="add">添加分类</el-button>
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form label-width="100px" :model="addCateForm" :rules="addCateRules" ref="addCateRef">
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类: ">
          <el-cascader
          v-model="selectedParentId"
          :options="parentCateList"
          :props="parentCateProps"
          @change="handleChange"
          clearable>
        </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示编辑对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          {required: true, message: '分类名称不能为空', trigger: 'blur'}
        ]
      },
      // 数据源
      parentCateList: [],
      // 级联选择器配置对象
      parentCateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        children: 'children',
        value: 'cat_id',
        // 可以选中一级分类
        checkStrictly: true
      },
      // 选中的父级分类的id放在里面，必须是一个数组
      selectedParentId: [],
      editForm: {
        cat_name: ''
      },
      editDialogVisible: false,
      editFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      cat_id: 0
    }
  },
  created() {
    this.getCateList()
  },
  methods:{
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      console.log(res)
      if(res.meta.status != 200) return this.$message.error('获取商品分类数据列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 选择每页显示几条数据触发
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getCateList()
    },
    // 选择当前页触发
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCateList()
    },
    // 展示添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if(res.meta.status != 200) return this.$message.error('获取父级分类列表失败')
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 级联选择器选中项改变时触发
    handleChange() {
      console.log(this.selectedParentId)

      if(this.selectedParentId.length > 0) {
        // 当前分类的父id
        this.addCateForm.cat_pid = this.selectedParentId[this.selectedParentId.length - 1]
        // 当前分类的等级
        this.addCateForm.cat_level = this.selectedParentId.length
      }else {
         // 当前分类的父id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类对话框关闭，重置表单
    addDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectedParentId = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 提交添加分类
    addCate() {
      this.$refs.addCateRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status != 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })     
    },
    removeCate(cat_id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete('categories/' + cat_id)
          if(res.meta.status != 200) return this.$message.error('删除分类失败')
          this.$message.success('删除分类成功')
          this.getCateList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
        })         
      })   
    },
    async showEditCateDialog(cat_id) {
      this.cat_id = cat_id
      const {data: res} = await this.$http.get('categories/' + cat_id)
      this.editForm.cat_name = res.data.cat_name
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    submitEditDialog() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('categories/' + this.cat_id, {cat_name: this.editForm.cat_name})
        if(res.meta.status != 200) return this.$message.error('更新分类失败')
        this.$message.success('更新分类成功')
        this.editDialogVisible = false
        this.getCateList()
      })
    }
  }
}
</script>
<style lang='less' scoped>
  .add {
    margin-bottom: 15px; 
  }
  .el-cascader {
    width: 100%;
  }
</style>