<template>
  <div class="home-header">
    <div>
      <span>电商管理后台</span>
    </div>
    <el-button type="success" round @click="quit" class="quit-button">退出</el-button>
  </div>
</template>
<script>
export default {
  name: 'HomeHeader',
  data() {
    return {}
  },
  methods: {
    //退出按钮被点击
    quit() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到login页面
      this.$router.push('/login')
    },
  },
}
</script>
<style lang="less" scoped>
.home-header {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

span {
  font-size: 20px;
}
</style>