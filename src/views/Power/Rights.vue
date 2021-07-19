<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label='#'></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag :type="typeList[scope.row.level]" effect="dark">{{scope.row.level}}</el-tag>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'Rights',
  data() {
    return {
      // 列表数据
      rightsList: [],
      // 权限等级的type
      typeList: {
        0: 'success',
        1: '',
        2: 'warning',
      },
    }
  },
  created() {
    // 获取列表数据
    this.getRightsList()
  },
  methods: {
    // 获取列表数据
    async getRightsList() {
      let { data } = await this.$http.get('rights/list ')
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      // 获取数据成功
      this.rightsList = data.data
    },
  },
}
</script>
<style  scoped>
</style>