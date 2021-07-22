<template>
  <el-container class="home-container">
    <el-header>
      <home-header></home-header>
    </el-header>
    <el-container>
      <home-aside></home-aside>
      <home-main></home-main>
    </el-container>
  </el-container>
</template>
<script>
import HomeAside from './HomeChilds/HomeAside.vue'
import HomeHeader from './HomeChilds/HomeHeader.vue'
import HomeMain from './HomeChilds/HomeMain.vue'
export default {
  name: 'Home',
  data() {
    return {}
  },
  components: {
    HomeHeader,
    HomeAside,
    HomeMain,
  },
  methods: {},
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: rgba(64, 158, 255);
  color: white;
}
</style>