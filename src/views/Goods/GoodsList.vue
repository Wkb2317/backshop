<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图  -->
    <el-card>
      <!-- 添加商品分类 -->
      <el-row>
        <el-col :span='5'>
          <el-button @click="addGoodsClick" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 添加分类的dialog -->
      <el-dialog @close="addCateDialogClose" title="添加分类" :visible.sync="addGoodsDialogVisible" width="50%">
        <div>
          <el-form :model="addGoodsList" :rules="addGoodsRules" label-width="100px" ref="addGoodsRef">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addGoodsList.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
              <el-cascader @change="selectChange" :options="parentCateList" v-model="selectedID" :props="parentCascaderProps" clearable></el-cascader>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer">
          <el-button @click="addGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- table区域 -->
      <tree-table :data="cateList" :columns="columns" :expand-type="false" :selection-type="false" :show-index="true" border>
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="small">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="small">二级</el-tag>
          <el-tag type="warning" v-else="scope.row.cat_level === 2" size="small">三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="operate" slot-scope="scope">
          <el-button @click="editClick(scope.row)" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button @click="deleteCate(scope.row)" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[ 3,5,10,15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑的dialog -->
    <el-dialog @close="editDialogClose" title="编辑" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="rowData" :rules="editFormRules" ref="editFromRefs" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="rowData.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'GoodList',
  data() {
    return {
      // 保存总的信息
      cateList: [],
      // 父级节点的信息
      parentCateList: [],
      // 请求总数据的对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      // tree-table表格配置
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
        },
        {
          label: '等级',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate',
        },
      ],
      addGoodsDialogVisible: false,
      // 添加分类的数据
      addGoodsList: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      // 添加分类的校验规则
      addGoodsRules: {
        cat_sname: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur',
          },
        ],
      },
      // 级联选中的id数组
      selectedID: [],
      // 级联规则
      parentCascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },

      editDialogVisible: false,
      // 保存要编辑行的信息
      rowData: {},
      // 编辑的规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /**
     *   数据请求方法
     **/

    // 获取分类列表的总信息
    async getCateList() {
      let { data } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (data.meta.status !== 200) {
        this.$message.error(data.meta.msg)
      }
      // 赋值
      this.cateList = data.data.result
      this.total = data.data.total
    },
    // 获取父级的信息
    async getParentCateList() {
      let { data } = await this.$http.get('categories', { params: { type: 2 } })
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      // 赋值
      this.parentCateList = data.data
    },

    /**
     *   监听
     **/

    // 分页数据的改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    handleCurrentChange(newcurrent) {
      this.queryInfo.pagenum = newcurrent
      this.getCateList()
    },
    //添加商品分类按钮的点击
    addGoodsClick() {
      // 先获取级联选择框的内容
      this.getParentCateList()
      this.addGoodsDialogVisible = true
    },
    // 选中时触发
    selectChange() {
      let len = this.selectedID.length
      if (len > 0) {
        // 选了
        this.addGoodsList.cat_level = len
        this.addGoodsList.cat_pid = this.selectedID[len - 1]
      } else {
        // 父级没有选中
        // 重置
        this.addGoodsList.cat_pid = 0
        this.addGoodsList.cat_level = 0
      }

      // console.log(this.addGoodsList)
    },
    // 添加分类的dialog关闭
    addCateDialogClose() {
      // 关闭后重置表单
      this.$refs.addGoodsRef.resetFields()
      // 把选中的值重置
      this.selectedID = []
      this.addGoodsList.cat_pid = 0
      this.addGoodsList.cat_level = 0
    },
    // 提交新的分类
    submitAddCate() {
      // 先进行表单的验证
      this.$refs.addGoodsRef.validate(async (res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        let { data } = await this.$http.post('categories', this.addGoodsList)
        if (data.meta.status !== 201) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success(data.meta.msg)
        // 刷新列表
        this.getCateList()
        this.addGoodsDialogVisible = false
      })
    },
    // 删除
    deleteCate(row) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          console.log(row)
          let { data } = await this.$http.delete('categories/' + row.cat_id)
          if (data.meta.status !== 200) {
            this.$message.error('删除失败')
          }
          this.getCateList()
          this.$message.success('删除成功!')
        })
        .catch(() => {
          this.$message.error('取消删除!')
        })
    },
    // 显示编辑dialog
    editClick(row) {
      // 在显示前赋初值
      this.rowData = row
      this.editDialogVisible = true
    },
    // 关闭editdialog时重置
    editDialogClose() {
      this.$refs.editFromRefs.resetFields()
      this.rowData = {}
    },
    // 提交编辑的分类
    submitEditCate() {
      // 先进行表单的验证
      this.$refs.editFromRefs.validate(async (res) => {
        if (!res) {
          return this.$message.error('格式错误')
        }
        // 发送请求
        let { data } = await this.$http.put(
          'categories/' + this.rowData.cat_id,
          { cat_name: this.rowData.cat_name }
        )
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success(data.meta.msg)
        // 刷新
        this.getCateList()
        // 关闭
        this.editDialogVisible = false
      })
    },
  },
}
</script>
<style  scoped>
.el-row {
  margin-bottom: 15px;
}

.el-pagination {
  margin-top: 15px;
}
</style>