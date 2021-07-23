<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部搜索 -->
      <el-row>
        <el-col :span="6">
          <el-input v-model="queryInfo.query" placeholder="请输入内容">
            <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table区域 -->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div>

            </div>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="500">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="scope">
            <div>
              <el-tag type="danger" v-if="scope.row.pay_status == '0' ">未付款</el-tag>
              <el-tag type="success" v-else>已付款</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100">
        </el-table-column>
        <el-table-column prop="update_time" label="下单时间">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="addressDialogVisible = true" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="showProgressDialog" type="success" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 15, 20 , 30]" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址的dialog -->
    <el-dialog @close="addressDialogClose" title="修改地址" :visible.sync="addressDialogVisible" width="50%">
      <div>
        <el-form :model="addressForm" ref="addressFormRef" :rules="addressFormRules" label-width="80px" :inline="false" size="normal">
          <el-form-item label="省市区县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1" clearable :props="{ expandTrigger: 'hover' }">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address1">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息的dialog -->
    <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
      <div>
        <el-timeline :reverse="true">
          <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.timestamp">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>
      </div>

    </el-dialog>
  </div>
</template>
<script>
import { formDate } from '@/common/utils'
// 导入城市数据
import cityData from '@/common/citydata.js'
export default {
  name: 'Order',
  data() {
    return {
      // 列表数据
      orderList: [],
      // 查询列表的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 总数
      total: 0,
      // 城市数据
      cityData,
      // 控制address dialog
      addressDialogVisible: false,
      progressDialogVisible: false,
      // 地址表单
      addressForm: {
        address1: [],
        address2: '',
      },
      // 表单校验规则
      addressFormRules: {
        address1: [
          { require: true, message: '请选择省市区县', trigger: 'blur' },
        ],
        address2: [
          { require: true, message: '请输入详细信息', trigger: 'blur' },
        ],
      },
      // 保存物流信息
      activities: [],
    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    // 获取订单的信息
    async getOrderList() {
      let { data } = await this.$http.get('orders', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      // 时间戳的转换
      data.data.goods.forEach((item) => {
        item.update_time = formDate(item.update_time)
      })
      this.orderList = data.data.goods
      this.total = data.data.total
      console.log(this.orderList)
    },

    // pagesize改变时
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      // 刷新页面
      this.getOrderList()
    },
    // 当前页码的改变
    handleCurrentChange(newcurrent) {
      this.queryInfo.pagenum = newcurrent
      // 刷新页面
      this.getOrderList()
    },

    // 头部搜索
    search() {
      // 根据input改变的query来刷新列表
      this.getOrderList()
    },

    addressDialogClose() {
      this.$refs.addressFormRef.resetFields()
    },

    // 展示物流地址dialog
    async showProgressDialog() {
      // let { data } = await this.$http.get('/kuaidi/804909574412544580')
      // console.log(data)
      this.progressDialogVisible = true
    },
  },
}
</script>
<style  scoped>
.el-row {
  margin-bottom: 15px;
}
</style>