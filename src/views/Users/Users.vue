<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加 -->
      <el-row :gutter="15" class="input">
        <el-col :span="10">
          <el-input clearable v-model="queryInfo.query" placeholder="请输入内容" class="input-with-select">
            <el-button @click="getListData" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="dialogFormVisible = true">添加用户</el-button>
          <!-- dialog -->
          <el-dialog @close="dialogClose" title="添加用户" :visible.sync="dialogFormVisible">
            <el-form :rules="addUserRules" :model="addUserInfo" ref="addUser">
              <el-form-item label="用户名称" prop="username" :label-width="formLabelWidth">
                <el-input v-model="addUserInfo.username" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="用户密码" prop="password" :label-width="formLabelWidth">
                <el-input v-model="addUserInfo.password" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email" :label-width="formLabelWidth">
                <el-input v-model="addUserInfo.email" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="mobile" :label-width="formLabelWidth">
                <el-input v-model="addUserInfo.mobile" autocomplete="off"></el-input>
              </el-form-item>
            </el-form>
            <!-- 底部 -->
            <div slot="footer" class="dialog-footer">
              <el-button @click="restForm">取 消</el-button>
              <el-button type="primary" @click="add">添加</el-button>
            </div>
          </el-dialog>
        </el-col>
      </el-row>
      <!-- 用户表格 -->
      <el-table :data="users" border style="width: 100%" :stripe="true">
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" @change="userstatu(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label=" 操作" width="220px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top" class="item" :enterable="false">
              <el-button @click="showEditDialog(scope.row.id)" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配权限" placement="top" class="item" :enterable="false">
              <el-button @click="setRights(scope.row)" type="danger" icon="el-icon-setting"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" class="item" :enterable="false">
              <el-button type="warning" icon="el-icon-delete" @click="delteuser(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 分配角色的dialog -->
    <el-dialog @close="setRolesdialogClose" :data="userList" title="分配权限" :visible.sync="setRolesdialogVisible" width="50%">
      <div>
        <p>姓名：{{userList.username}}</p>
        <p>角色：{{userList.role_name}}</p>
        <p>请选择：
          <el-select v-model="selectedRoles" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改 dialog -->
    <el-dialog title="修改" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editRuleForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Users',
  data() {
    // 邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/
      if (regEmail.test(value)) {
        // 正确的邮箱格式
        return callback()
      }
      callback(new Error('邮箱格式错误'))
    }
    // 手机号验证规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 4,
      },
      total: 0,
      users: [],
      addUserInfo: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
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
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail },
        ],
        mobile: [
          { required: true, message: '请输入号码', trigger: 'blur' },
          { validator: checkMobile },
        ],
      },
      editForm: {},
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail },
        ],
        mobile: [
          { required: true, message: '请输入号码', trigger: 'blur' },
          { validator: checkMobile },
        ],
      },
      dialogFormVisible: false,
      editDialogVisible: false,
      setRolesdialogVisible: false,
      formLabelWidth: '200px',
      // 需要被分配的角色信息
      userList: {},
      // 所有的角色信息
      rolesList: [],
      // 选中的角色id
      selectedRoles: null,
    }
  },
  created() {
    //当创建的时候，请求数据
    this.getListData()
  },
  methods: {
    // 请求用户数据
    async getListData() {
      let { data } = await this.$http.get('users', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('数据请求失败')
      }
      this.total = data.data.total
      this.users = data.data.users
    },
    //监听分页数据的改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getListData()
    },
    handleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent
      this.getListData()
    },
    //用户状态修改
    async userstatu(value) {
      let { data } = await this.$http.put(
        `users/${value.id}/state/${value.mg_state}`
      )

      if (data.meta.status !== 200) {
        // 如果操作失败，还需要修改之气改的步骤
        value.mg_state = !value.mg_state
        return this.$message.error('更新数据失败')
      }
      this.$message.success('更新用户数据成功')
    },
    // adduser dialog被关闭
    dialogClose() {
      this.$refs.addUser.resetFields()
    },
    // 重置表单
    restForm() {
      this.dialogFormVisible = false
      this.$refs.addUser.resetFields()
    },
    // 添加用户
    add() {
      // 进行表单的验证
      this.$refs.addUser.validate((res) => {
        if (!res) {
          return this.$message.error('添加失败')
        }
        // // 表单的数据符合规则
        this.$http.post('users', this.addUserInfo).then((res) => {
          // console.log(res)
          if (res.data.meta.status !== 201) {
            return this.$message.error(res.data.meta.msg)
          }
          this.$message.success('添加成功')
        })

        this.dialogFormVisible = false
        // 刷新列表
        this.getListData()
      })
    },
    // 展示修改的dialog
    async showEditDialog(id) {
      this.editDialogVisible = true
      // console.log(id)
      let { data } = await this.$http.get('users/' + id)
      // console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      // console.log(data)
      this.editForm = data.data

      // console.log(this.editForm)
    },
    // 修改完成，确认按钮被点击
    editInfo() {
      this.$refs.editRuleForm.validate(async (res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        // 表单验证成功
        // 发送请求
        let { data } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        })
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        // console.log(data)
        this.$message.success(data.meta.msg)
        // 修改成功后，再次更新列表数据
        this.getListData()
        this.editDialogVisible = false
      })
    },
    // editdialog  close
    editDialogClose() {
      this.$refs.editRuleForm.resetFields()
    },
    // 删除 复确认
    delteuser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async (res) => {
          let { data } = await this.$http.delete('users/' + id)
          if (data.meta.status !== 200) {
            return this.$message.err(data.meta.msg)
          }
          // 重新请求数据，刷新列表
          this.getListData()
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch((res) => {
          console.log(res)
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 分配用户角色 打开dialog
    async setRights(roles) {
      // 保存本行的数据
      this.userList = roles
      // 请求数据
      let { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('获取列表数据失败')
      }
      this.rolesList = data.data

      // 打开dialog
      this.setRolesdialogVisible = true
    },
    // 提交角色的分配
    async submitRoles() {
      if (this.selectedRoles == null) {
        return this.$message.error('请选择需要分配的角色')
      }
      console.log(this.userList)
      console.log(this.selectedRoles)
      let { data } = await this.$http.put(`users/${this.userList.id}/role`, {
        rid: this.selectedRoles,
      })
      console.log(data)
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.$message.success(data.meta.msg)
      // 刷新列表
      this.getListData()
      this.setRolesdialogVisible = false
    },
    // 分配角色的dialog关闭时
    setRolesdialogClose() {
      // 初始化选中的用户selectedRoles 和 将要分配的行信息
      this.userList = {}
      this.selectedRoles = null
    },
  },
}
</script>
<style  scoped>
.input {
  margin-bottom: 15px;
}

.el-pagination {
  margin-top: 15px;
}
</style>