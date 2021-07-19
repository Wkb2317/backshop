<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
          <!-- 添加角色dialog -->
          <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%" @close="RolesdialogClose">
            <el-form :model="Roles" :rules="rules" ref="ruleForm" label-width="100px">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="Roles.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="Roles.roleDesc"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="rolescancel">取 消</el-button>
              <el-button type="primary" @click="submitRoles">确 定</el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table border stripe :data="rolesList">
        <!-- 展开 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" :class="{'rowbottom':true,'rowtop':index1==0}">
              <!-- 一级 -->
              <el-col :span="5">
                <el-tag @close="removeRoles(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级 -->
              <!-- 二级和三级行数相同，所以放在一个row里 -->
              <el-col :span="19">
                <el-row v-for="(item2,index2) in item1.children" :key="item2.id" :class="{'rowtop':index2!==0}">
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag @close="removeRoles(scope.row,item2.id)" closable type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag @close="removeRoles(scope.row,item3.id)" closable v-for="(item3,index3) in item2.children" type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button @click="editClick(scope.row.id)" type="primary" icon="el-icon-edit" size="small">编辑</el-button>
            <el-button @click="showSetDialog(scope.row)" type="warning" icon="el-icon-setting" size="small">分配权限</el-button>
            <el-button @click="deleteClick(scope.row.id)" type="danger" icon="el-icon-delete" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的dialog -->
    <el-dialog @close="setDialogClose" title="分配权限" :visible.sync="setDialogVisible" width="50%">
      <span>
        <el-tree ref="rightsTree" :data="rightsList" :props="treeProps" node-key="id" :default-checked-keys="checkedId" show-checkbox default-expand-all>
        </el-tree>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSetRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑的dialog -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="Edit" :rules="rules" ref="editruleForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="Edit.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="Edit.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCancel">取 消</el-button>
        <el-button type="primary" @click="editSubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      setDialogVisible: false,
      // 添加的属性
      Roles: {
        roleName: '',
        roleDesc: '',
      },
      // 规则
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
      // 存储编辑后的属性
      Edit: {},
      // 树形结构数据
      rightsList: [],
      // 树形展示数据规则
      treeProps: {
        childeren: 'children',
        label: 'authName',
      },
      // 需要默认选中的id
      checkedId: [],
      // 保存当前要分配权限的id
      rolesId: '',
    }
  },
  created() {
    // 获取数据
    this.getRolesList()
  },
  methods: {
    // 获取数据
    async getRolesList() {
      let { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        this.$message.error(data.meta.msg)
      }
      this.rolesList = data.data
      //console.log(this.rolesList)
    },
    // 添加角色
    addRoles() {
      // 打开dialog
      this.addDialogVisible = true
    },
    // dialog 关闭
    RolesdialogClose() {
      // 重置form
      this.$refs.ruleForm.resetFields()
    },
    // dialog 取消按钮被点击
    rolescancel() {
      // 重置form
      this.$refs.ruleForm.resetFields()
      this.addDialogVisible = false
    },
    // 添加用户的提交
    submitRoles() {
      this.$refs.ruleForm.validate(async (res) => {
        if (!res) {
          // 验证失败
          this.$message.error('格式错误')
        }

        // 表单验证成功，发送请求
        let { data } = await this.$http.post('roles', this.Roles)
        if (data.meta.status !== 201) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success('添加成功')
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    // edit点击
    async editClick(id) {
      // 发送请求，保存要点击的信息
      let { data } = await this.$http.get('roles/' + id)
      if (data.meta.status !== 200) {
        this.$message.error(data.meta.msg)
      }
      this.Edit = data.data
      // console.log(this.Edit)
      this.editDialogVisible = true
    },
    // edit 取消点击
    editCancel() {
      this.$refs.editruleForm.resetFields()
      this.editDialogVisible = false
    },
    // edit提交点击
    editSubmit() {
      this.$refs.editruleForm.validate(async (res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        // 表单校验成功
        let { data } = await this.$http.put('roles/' + this.Edit.roleId, {
          roleName: this.Edit.roleName,
          roleDesc: this.Edit.roleDesc,
        })
        console.log(data)
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success('更改成功')
        this.getRolesList()
        this.editDialogVisible = false
      })
    },
    // 删除
    deleteClick(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          //发送删除的请求
          let { data } = await this.$http.delete('roles/' + id)
          if (data.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 根据id删除权限
    removeRoles(row, rightid) {
      this.$confirm('此操作将会永久删除此权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // 确认删除，发送请求
          let { data } = await this.$http.delete(
            `roles/${row.id}/rights/${rightid}`
          )

          if (data.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          // 重新赋值，刷新列表
          // 这里不用getRolesList，会刷新整个页面
          row.children = data.data
          this.$message({
            type: 'success',
            message: '删除成功',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除',
          })
        })
    },
    // 展示分配权限的dialog
    async showSetDialog(row) {
      // 保存当前的id
      this.rolesId = row.id
      // 获取树形的数据
      let { data } = await this.$http('rights/tree')
      if (data.meta.status !== 200) {
        this.$message.error('获取数据失败')
      }
      this.rightsList = data.data
      // 在展示分配权限的dialog前，获取需要选中的id
      this.getId(row, this.checkedId)
      this.setDialogVisible = true
    },
    // 获取三级节点的id
    getId(node, arr) {
      // 判断是不是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点
      node.children.forEach((item) => {
        return this.getId(item, arr)
      })
    },
    //当setdialog关闭的时候，重置checkedId
    setDialogClose() {
      this.checkedId = []
    },
    // 提交修改权限
    async submitSetRights() {
      // 获取选中的节点id
      const arrId = [
        ...this.$refs.rightsTree.getCheckedKeys(),
        ...this.$refs.rightsTree.getHalfCheckedKeys(),
      ]
      // console.log(arrId)
      let rids = arrId.join(',')
      // 角色授权
      let { data } = await this.$http.post(`roles/${this.rolesId}/rights`, {
        rids: rids,
      })
      if (data.meta.status !== 200) {
        return this.$message.error('设置权限失败')
      }
      this.$message.success('设置权限成功')
      // 刷新列表
      this.getRolesList()
      this.setDialogVisible = false
    },
  },
}
</script>
<style  scoped>
.el-row {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.el-tag {
  margin: 10px;
}

.rowtop {
  border-top: 1px solid rgb(0, 0, 0, 0.1);
}

.rowbottom {
  border-bottom: 1px solid rgb(0, 0, 0, 0.1);
}
</style>