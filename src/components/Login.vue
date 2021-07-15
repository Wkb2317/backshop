<template>
  <div id="Login">
    <div class="login-box">
      <!-- 登录头像 -->
      <div class="login-picture">
        <img src="@/assets/img/login.jpg" alt="">
      </div>

      <el-form class="login-form" ref="loginFromRef" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="账号" prefix-icon="iconfont icon-wode" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input placeholder="密码" prefix-icon="iconfont icon-shouquan" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="buts">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button type="info" round @click="restForm">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 12,
            message: '长度在 6 到 12 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    // 点击重置
    restForm() {
      this.$refs.loginFromRef.resetFields()
    },
    // 表单的预验证
    login() {
      this.$refs.loginFromRef.validate(async (res) => {
        if (!res) {
          return
        }
        // 发送网络请求
        let { data } = await this.$http.post('login', this.loginForm)
        //console.log(data)
        // 判断状态码
        if (data.meta.status !== 200) {
          return this.$message.error('登录失败')
        }
        this.$message.success('登录成功')
        // 存储token
        window.sessionStorage.setItem('token', data.data.token)
        this.$router.push('/home')
      })
    },
  },
}
</script>
<style  scoped lang="less">
#Login {
  position: relative;
  background-color: rgba(40, 44, 52);
  height: 100%;
  width: 100%;

  .login-box {
    width: 450px;
    height: 300px;
    border-radius: 20px;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .login-picture img {
      height: 80px;
      width: 120px;
      box-shadow: 0 0 5px white;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 20px;
  }

  .buts {
    display: flex;
    justify-content: flex-end;
  }
}
</style>