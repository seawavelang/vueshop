<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary">添加角色</el-button>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row v-for="item1 in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row v-for="item2 in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRight(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
            <el-button icon="el-icon-setting" type="warning" size="mini" @click="allocateRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="allocateRightDialogVisible"
      width="60%">
      <!-- 树形权限 -->
      <el-tree :data="rightsList" :props="defaultProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocateRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList()
  },
  data () {
    return {
      rolesList: [],
      allocateRightDialogVisible: false,
      rightsList: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      defkeys: [],
      id: 0
    }
  },
  methods:{
    async getRolesList() {
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status != 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    // 删除权限
    removeRight(role, rightId) {
      // console.log(role.id)
      // console.log(rightId)
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status != 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      // 重新调用这个函数权限会关掉，用户体验不好
      // this.getRolesList()
      // role.children是权限
      role.children = res.data
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })         
      })   
    },
    // 打开分配权限对话框
    async allocateRightDialog(row) {
      this.id = row.id
      var myArr = [] // 收集所有的id值
      function collectIdArr(arr) {
        for(var i = 0; i < arr.length; i++) {
          // myArr.push(arr[i].id)
          // console.log(myArr)
          // arr[i]居然还有一个属性叫children, 还是一个数组
          if(arr[i].children) {
            collectIdArr(arr[i].children)
          }else {
            // 只存最后一级的id,只有当前这一级没有children,说明是最后一级
            myArr.push(arr[i].id)
          }
        }
      }
      // row.children是权限数据，是一个数组
      collectIdArr(row.children)
      // console.log(myArr)
      this.defkeys = myArr

      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status != 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data
      console.log(res)
      this.allocateRightDialogVisible = true
    },
    // 分配权限
    async allocateRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys)
      const idStr = keys.join(',')
      // console.log(idStr)
      const {data: res} = await this.$http.post( `roles/${this.id}/rights`, {rids: idStr})
      if(res.meta.status != 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.allocateRightDialogVisible = false
      this.getRolesList()
    }
  }
}
</script>
<style lang='less' scoped>
  .el-tag {
    margin: 7px;
  }
  
  .el-row {
    border-bottom: 1px solid #eee;
  }
  .el-row:first-of-type {
    border-top: 1px solid #eee;
  }
</style>