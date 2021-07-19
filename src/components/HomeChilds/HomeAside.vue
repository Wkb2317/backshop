<template>
  <el-aside :width=" !isCollapse ? '200px' : '65px'">
    <div class="aside">
      <div class="toggo" @click="toggoclick">|||</div>
      <!-- 开启路由模式 -->
      <el-menu :default-active="activeNav" class="el-menu-vertical-demo" :unique-opened="true" :collapse-transition="false" :collapse="isCollapse" :router="true">

        <!-- submenu 是一级菜单 -->
        <!-- element 中必须绑定不同的index，不然相同的index点击会一起打开 -->
        <el-submenu :index="item.id.toString()" v-for="(item,index) in MenuList" :key="item.id">
          <template slot="title">
            <!-- 动态绑定图标，利用id的唯一值 -->
            <i :class="icons[item.id]"></i>
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->

          <el-menu-item v-if="item.children.length !== 0" v-for="(child,index) in item.children" :key="child.id" :index=" '/' + child.path" @click="navclick('/' + child.path)">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span slot="title">{{child.authName}}</span>
            </template>
          </el-menu-item>

        </el-submenu>

      </el-menu>

    </div>
  </el-aside>
</template>
<script>
export default {
  name: 'HomeAside',
  data() {
    return {
      // 左侧数据
      MenuList: [],
      // 图标对象
      icons: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing',
      },
      // 是否折叠与展开
      isCollapse: false,
      // 当前被点击的二级列表
      activeNav: '',
    }
  },
  created() {
    // 在创建的时候就获取左侧的数据
    this.getMenuList()
    // 获取存储的activepath
    this.activeNav = window.sessionStorage.getItem('activepath')
  },
  methods: {
    // 获取左侧数据
    async getMenuList() {
      const { data } = await this.$http.get('menus')
      //console.log(data)
      // 判断状态码，如果不是200
      if (data.meta.status !== 200) {
        return this.$message.error('获取菜单列表失败')
      }
      // 若果状态码是200，则访问成功，数据赋值
      this.MenuList = data.data
      // console.log(this.MenuList)
    },

    // 切换点击
    toggoclick() {
      this.isCollapse = !this.isCollapse
    },

    // 二级菜单的点击
    navclick(activepath) {
      // 保存被点击的路径
      this.activeNav = activepath
      window.sessionStorage.setItem('activepath', activepath)
    },
  },
}
</script>
<style  scoped>
.el-aside {
  background-color: #f4f4f4;
}
.aside {
  height: 100%;
}

.toggo {
  width: 100%;
  background-color: white;
  color: rgba(1, 1, 1, 0.5);
  text-align: center;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
}
</style>
