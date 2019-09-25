<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="queryInfo.query" clearable @clear="getGoodsList()" @keyup.enter.native="getGoodsList()">
            <el-button class="el-icon-search" slot="append" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="goGoodsAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goods" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" >
          <template slot-scope="scope">
            {{scope.row.add_time | dateformat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    // 获取商品列表
    this.getGoodsList()
  },
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goods: [],
      total: 0
    }
  },
  methods:{
    // 获取商品列表
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
      console.log(res)
      if(res.meta.status != 200) return this.$message.error('获取数据失败')
      this.goods = res.data.goods
      this.total = res.data.total
    },
    // 选择每页显示几条数据时触发
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    // 选择当前页时触发
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 删除商品
    removeGoods(id) {
      console.log(id)
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if(res.meta.status != 200) return this.$message.error('删除商品失败')
        this.$message.success('删除商品成功')
        this.getGoodsList()
       
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })        
      })
    },
    goGoodsAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang='less' scoped>
  
</style>