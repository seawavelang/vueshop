<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb> 
    <el-card>
      <el-row>
        <el-col :span="9">
          <el-input label="请输入搜索内容">
            <el-button icon="el-icon-search" slot="append"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table border stripe :data="orderList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="primary">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateformat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showWuliuDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
     <!-- 修改订单对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog><source>
    <!-- 物流对话框 -->
    <el-dialog
      title="查看物流进度"
      :visible.sync="wuliuDialogVisible"
      width="50%">
      <!-- 时间线 -->
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  created() {
    this.getOrderList()
  },
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {required: true,
          message: '请选择省市区/县', trigger: 'blur'}
        ],
        address2: [
          {required: true,
          message: '请填写详细地址', trigger: 'blur'}
        ]
      },
      cityData,
      wuliuDialogVisible: false,
      progressInfo: []
    }
  },
  methods:{
    async getOrderList() {
      const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
      console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    showAddressDialog() {
      this.addressDialogVisible = true
    },
    handleChange() {

    },
    // 展示物流对话框
    async showWuliuDialog() {
      const {data: res} = await this.$http.get('/kuaidi/1106975712662')
      console.log(res)
      this.progressInfo = res.data
      this.wuliuDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    }
  }
}
</script>
<style lang='less' scoped>
  .el-cascader {
    width: 100%;
  } 
</style>