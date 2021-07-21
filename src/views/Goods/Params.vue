<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>

      <!-- 警告区域 -->
      <el-alert show-icon :closable="false" title="注意,只能为第三级设置相关属性" type="warning">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="row">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCate" :options="catelist" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 分页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 动态参数标签页 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible = true" type="primary" :disabled="isDisable">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <!-- 动态参数的下拉 -->
              <template slot-scope="scope">
                <el-tag @close="tagClose(scope.row,index)" v-for="(item,index) in scope.row.attr_vals" :key="index" closable>
                  {{item}}
                </el-tag>
                <el-input class="new-tag-input" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditDialog(scope.row)" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="deleteParams(scope.row)" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性标签页 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="addDialogVisible = true" type="primary" :disabled="isDisable">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <!-- 静态属性的下拉 -->
              <template slot-scope="scope">
                <el-tag @close="tagClose(scope.row,index)" v-for="(item,index) in scope.row.attr_vals" :key="index" closable>
                  {{item}}
                </el-tag>
                <el-input class="new-tag-input" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showEditDialog(scope.row)" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="deleteParams(scope.row)" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数dialog -->
    <el-dialog @close="addDialogClose" :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数dialog -->
    <el-dialog @close="editDialogClose" :title="'添加' + titleText" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品数据
      catelist: [],
      // 级联规则
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 级联选中的id
      selectedCate: [],
      // tabs 当前选中的名称
      activeName: 'many',
      // 动态表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 控制添加属性的dialog
      addDialogVisible: false,
      // 保存填的数据
      addForm: {
        attr_name: '',
      },
      // 校验规则
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      // edit的dialog
      editDialogVisible: false,
      // 保存编辑的数据
      editForm: {},
      // 编辑的校验规则
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      //
    }
  },
  created() {
    this.getlist()
  },
  // 计算属性
  computed: {
    // 分页里的button的是否为禁用
    isDisable() {
      if (this.selectedCate.length !== 3) {
        return true
      }
      return false
    },
    // 当前的三级id
    cateId() {
      if (this.selectedCate.length === 3) {
        return this.selectedCate[this.selectedCate.length - 1]
      } else {
        return null
      }
    },
    // diaolog的title
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
  methods: {
    // 获取分类数据列表
    async getlist() {
      let { data } = await this.$http.get('categories')
      if (data.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      // 赋值
      this.catelist = data.data
    },

    // 级联的选中改变
    handleChange() {
      // 判断是不是三级
      if (this.selectedCate.length !== 3) {
        this.selectedCate = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 是三级

      // 调用请求参数列表数据
      this.getParamsData()
    },

    // 获取动态参数/静态属性列表数据
    async getParamsData() {
      // 请求数据
      let { data } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }

      //先对数据进行处理
      data.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每个元素添加控制 new tag的属性
        item.inputVisible = false
        item.inputValue = ''
      })

      // 判断是动态数据还是静态数据
      if (this.activeName == 'many') {
        this.manyTableData = data.data
        // console.log(this.manyTableData)
      } else {
        // console.log(data.data)
        this.onlyTableData = data.data
      }
    },

    // tabs的点击,切换动态参数和静态属性
    handleTabsClick() {
      // 当activename改变时，调用请求数据
      this.getParamsData()
    },

    // 监听adddialog的关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加参数的提交数据
    addParams() {
      // 先进行表单的验证
      this.$refs.addFormRef.validate(async (res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        let { data } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )

        if (data.meta.status !== 201) {
          this.$message.error('添加数据失败')
        }
        this.$message.success('添加数据成功')
        // 请求相应的动态或者静态数据
        this.getParamsData()
        // 关闭dialog
        this.addDialogVisible = false
      })
    },

    // 监听editdialog的关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },

    // 展示editdialog
    showEditDialog(row) {
      // 展示前获取本行的信息
      this.editForm = row
      this.editDialogVisible = true
    },

    // 编辑 数据的提交
    editParams() {
      // 先进行表单的验证
      this.$refs.editFormRef.validate((res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        // 符合规则
        // 请求当前要提交的分类信息
        this.$http
          .put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            }
          )
          .then((data) => {
            if (data.data.meta.status !== 200) {
              return this.$message.error('更改失败')
            }
            this.$message.success(data.data.meta.msg)
            // 刷新表格数据
            this.getParamsData()
            // 关闭dialog
            this.editDialogVisible = false
          })
      })
    },

    // 删除参数或属性
    deleteParams(row) {
      this.editForm = row
      this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // console.log(this.editForm)
          // 确认删除
          let { data } = await this.$http.delete(
            `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`
          )
          if (data.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          // 刷新列表
          this.getParamsData()
          this.$message.success('删除成功')
        })
        .catch(() => {
          this.$message.error('取消删除')
        })
    },

    // 当失去焦点 或者 按下 enter 时 input 隐藏
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 将输入的值push到数组中，然后发起请求
      row.attr_vals.push(row.inputValue.trim())
      // 调用保存函数
      this.saveAttrVals()
    },

    // 保存attr_vals的值
    async saveAttrVals(row) {
      let { data } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' '),
        }
      )

      if (data.meta.status !== 200) {
        return this.$message.error('添加失败')
      }
      this.$message.success('添加成功')
      row.inputValue = ''
      row.inputVisible = false
    },

    // 展示new tag 的输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 当页面元素重新渲染的时候，才会执行里面的回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除tag事件
    tagClose(row, index) {
      //删除索引为index的元素
      row.attr_vals.splice(index, 1)
      // 调用保存函数
      this.saveAttrVals(row)
    },
  },
}
</script>
<style  scoped>
.row {
  margin-top: 15px;
}

.el-button {
  margin-bottom: 15px;
}

.el-tag {
  margin-right: 10px;
}

.new-tag-input {
  width: 120px;
}
</style>