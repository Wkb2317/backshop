<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片式图 -->
    <el-card>
      <!-- 头部搜索和添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" @clear="getGoodsList()" :clearable="true" placeholder="请输入内容">
            <el-button @click="getGoodsList()" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button @click="addGoods" type="primary">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="500px">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="120px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="deleteGoods(scope.row.goods_id)" type="danger" icon="el-icon-delete"></el-button>
          </template>

        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 15, 20 , 30]" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

  </div>
</template>
<script>
export default {
  name: 'List',
  data() {
    return {
      // 商品列表数据
      goodsList: [],
      // 总数
      total: 0,
      // 请求商品列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
    }
  },
  created() {
    // 在组件创建的时候就请求列表数据
    this.getGoodsList()
  },
  methods: {
    // 格式化时间
    formDate(date) {
      let newdate = new Date(date)
      let year = newdate.getFullYear()
      let month = newdate.getMonth() + 1
      let day = newdate.getDate()
      let hour = newdate.getHours()
      let min = newdate.getMinutes()
      let s = newdate.getSeconds()
      return `${year}-${month}-${day} ${hour}-${min}-${s}`
    },

    // 请求商品列表信息
    async getGoodsList() {
      let { data } = await this.$http.get('goods', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      // 时间戳转换
      data.data.goods.forEach((item) => {
        item.add_time = this.formDate(item.add_time)
      })

      this.goodsList = data.data.goods
      this.total = data.data.total
    },

    // pagesize改变时
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      // 刷新页面
      this.getGoodsList()
    },
    // 当前页码的改变
    handleCurrentChange(newcurrent) {
      this.queryInfo.pagenum = newcurrent
      // 刷新页面
      this.getGoodsList()
    },

    // 删除商品
    deleteGoods(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // 删除，发送请求
          let { data } = await this.$http.delete(`goods/${id}`)
          if (data.meta.status !== 200) {
            this.$message.error('删除失败')
          }
          // 刷新表格
          this.getGoodsList()
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },

    // 跳转添加商品页面
    addGoods() {
      this.$router.push('/goods/add')
    },
  },
}
</script>
<style  scoped>
.el-row {
  margin-bottom: 15px;
}

.el-col {
  margin-right: 10px;
}

.el-pagination {
  margin-top: 15px;
}
</style>