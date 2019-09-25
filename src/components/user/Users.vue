<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 栅格布局layout -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 用户列表 -->
      <el-table border stripe :data="usersList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 布尔值无法直接在页面上显示出来 -->
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <!-- v-model将开关状态与数据绑定到一块 -->
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="success" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAllocateroleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- handleSizeChange表示选择每页显示几条数据 -->
      <!-- handleCurrentChange表示当前页 -->
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 6]" 
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="addUserDialogVisible"
    width="60%" @closed="addUserDialogClosed">
      <el-form label-width="80px" :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="60%" @closed="editDialogClosed">
      <el-form label-width="80px" :model="editUserForm" :rules="editUserRules" ref="editUserRef">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%" @close="resetSetRoleDialog">
      <p>当前的用户: {{userInfo.username}}</p>
      <p>当前的角色: {{userInfo.role_name}}</p>
      <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
  </el-dialog>
  </div>
</template>
<script>
import { userInfo } from 'os';
export default {
  // 获取用户列表
  // getUserList这个函数也可以写在created里面，但写里面的话created的代码量就会太多，不好
  created() {
    this.getUserList()
  },
  data () {
    // 自定义验证邮箱
    var checkEmail = function(rule, value, cb) {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if(regEmail.test(value)) {
         cb()
      }else {
         cb(new Error('请输入合法的邮箱'))
      }
    }
    // 自定义验证手机号
    var checkMobile = function(rule, value, cb) {
      const regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if(regMobile.test(value)) {
        cb()
      }else {
        cb(new Error('请输入合法的手机号'))
      }
    }

    return {
      queryInfo: {
        query: '', // 查询的关键字
        pagenum: 1, // 当前页码
        pagesize: 4 // 每页显示的数据条数
      },
      usersList: [], // 用户数据
      total: 0,
      addUserDialogVisible: false, // 数据总条数
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户验证规则
      addUserFormRules: {
        username: [
          {required: true, message: '用户名称不能为空', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'},
          {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '邮箱名称不能为空', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '手机号不能为空', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]      
      },
      editDialogVisible: false,
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 修改用户验证规则
      editUserRules: {
        email: [
          {required: true, message: '邮箱名称不能为空', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
         mobile: [
          {required: true, message: '手机号不能为空', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]   
      },
      id: 0,
      setRoleDialogVisible: false,
      roleList: [],
      userInfo: {},
      selectedRoleId: ''
    }
  },
  methods:{
    // 获取用户列表
    async getUserList() {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})
      if(res.meta.status != 200) return this.$messaga.error('获取用户信息失败')
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 修改用户状态
    async changeUserState(userInfo) {
      console.log(userInfo)
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(res.meta.status != 200) return this.$message.error('修改用户状态失败')
      this.$message.success('修改用户状态成功')
    },
    // 页数
    // 上面的函数不需要传参
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    // 添加用户表单预验证
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        // console.log(valid)
        if(valid == false) return
        // 验证通过了
        const {data: res} = await this.$http.post('users', this.addUserForm)
        if(res.meta.status != 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.getUserList()
        this.addUserDialogVisible = false
        console.log(res)
      })
    },
    // 添加对话框关闭时 重置表单
    addUserDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 修改用户对话框
    async showEditDialog(id) {
      this.id = id
      // console.log(id)
      // console.log(await this.$http.get('users/' + id))
      const {data: res} = await this.$http.get('users/' + id)
      if(res.meta.status != 200) return this.$message.error('获取用户信息失败')
      // 将用户信息展示在页面上，直接将数据赋值给表单的model值就可以
      this.editUserForm = res.data      
      this.editDialogVisible = true
    },
    // 修改用户表单提交的预验证 
    editUser() {
      this.$refs.editUserRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('users/' + this.id, {email: this.editUserForm.email,
        mobile: this.editUserForm.mobile})
        if(res.meta.status != 200) return this.$message.error('修改用户信息失败')
        this.$message.success('修改用户信息成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 重置修改用户表单,也就是触发对话框的关闭事件 
    editDialogClosed() {
      this.$refs.editUserRef.resetFields()
    },
    // 删除用户
    removeUser(id) {
      // console.log(id)
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
      const {data: res} = await this.$http.delete('users/' + id)
      // console.log(res)
      if(res.meta.status != 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
      })
      .catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })       
      })
    },
    // 展示分配角色对话框
    async showAllocateroleDialog(userInfo) {

      const {data: res} = await this.$http.get('roles')
      if(res.meta.status != 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
      this.userInfo = userInfo
      console.log(userInfo)
      this.setRoleDialogVisible = true
    },
    // 分配角色
    async setRole() {
      // 当没有选择角色时，点击确定
      if(!this.selectedRoleId) {
        this.$message.error('请选择要分配的角色')
        return
      }

      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
      if(res.meta.status != 200) return this.$message.error('设置角色失败')
      this.$message.success('设置角色成功')
      this.setRoleDialogVisible = false
      this.getUserList()
    },
    // 重置分配角色对话框
    resetSetRoleDialog() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }}
</script>
<style lang='less' scoped>
  p {
    margin-top: 10px;
  }
</style>