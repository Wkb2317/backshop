<template>
  <div>
    <el-button type="info" round @click="quit">退出</el-button>
  </div>
</template>
<script>
export default {
  name: 'Home',
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
</style>