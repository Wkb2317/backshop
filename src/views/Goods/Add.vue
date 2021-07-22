<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品数信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" :align-center="true">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-tabs @tab-click="tabClick" :before-leave="berforeTabsLeave" v-model="activeIndex" tab-position="left">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" width="200px">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="bumber" v-model="addForm.goods_number" prop="goods_bumber"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateListProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableList" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="i" v-for="i in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableList" :label="item.attr_name">
              <el-input class="onlyDataInput" v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :on-success="uploadSuccess" :headers="headerObj" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button @click="addGoodsClick" class="addBtn" type="primary">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览dialog -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="previewImg" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data() {
    return {
      // 控制进度条当前激活的index
      activeIndex: '0',
      // 添加商品的信息
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选中的id数组
        goods_cat: [],
        // 图片的上传地址
        pics: [],
        // 商品描述
        goods_introduce: '',
        attrs: [],
      },
      // 添加商品的校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      // 商品分类总数据
      cateList: [],
      // 级联选择器的规则
      cateListProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 商品参数
      manyTableList: [],
      // 商品属性
      onlyTableList: [],
      // 图片上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的头部
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片预览的地址
      previewImg: '',
      // 控制图片预览dialog
      picDialogVisible: false,
    }
  },

  created() {
    // 获取商品分类的总数据
    this.getCateList()
  },

  computed: {
    cateId() {
      return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    },
  },

  methods: {
    // 获取商品分类的总数据
    async getCateList() {
      let { data } = await this.$http.get('categories')
      if (data.meta.status !== 200) {
        return this.$message('获取分类数据失败')
      }
      this.cateList = data.data
    },
    // 级联选择器选择时触发
    handleChange() {
      // 判断选中的是不是三级标签
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      console.log(this.addForm.goods_cat)
    },

    // 在点击切换tabs时触发
    berforeTabsLeave(activeName, oldActiveName) {
      // 如果在name 为 0时 并且 没有选择三级分类时
      if (this.addForm.goods_cat.length !== 3 && this.activeIndex == '0') {
        this.$message.error('请选择商品分类')
        // 禁止跳转
        return false
      }
    },

    // tab点击的时候触发
    async tabClick() {
      // 判断切换到商品参数
      if (this.activeIndex == '1' && this.addForm.goods_cat.length == 3) {
        // 请求商品动态参数的数据
        let { data } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (data.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        // 先对attr_vals分割成数组
        data.data.forEach((item) => {
          // 如果长度为 0 , 不需要分割
          item.attr_vals =
            item.attr_vals.length != 0 ? item.attr_vals.split(' ') : []
        })
        this.manyTableList = data.data
        // console.log(this.manyTableList)
      } else if (
        this.activeIndex == '2' &&
        this.addForm.goods_cat.length == 3
      ) {
        // 请求商品属性的信息
        let { data } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )

        if (data.meta.status !== 200) {
          return this.$message.error('获取静态数据失败')
        }
        this.onlyTableList = data.data
        // console.log(this.onlyTableList)
      }
    },

    // 图片预览
    handlePreview(file) {
      console.log(file)
      this.previewImg = file.response.data.url
      // console.log(this.previewImg)
      this.picDialogVisible = true
    },
    // 图片移除时触发
    handleRemove(file) {
      const removeURL = file.response.data.tmp_path
      let index = this.addForm.pics.findIndex((item) => {
        return item.pic == removeURL
      })
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm.pics)
    },
    // 上传图片成功
    uploadSuccess(res) {
      if (res.meta.status !== 200) {
        return this.$message.error('上传图片失败')
      }
      // console.log(res)
      const picAddress = {
        pic: res.data.tmp_path,
      }
      this.addForm.pics.push(picAddress)
      // console.log(this.addForm.pics)
    },

    //添加商品的按钮被点击
    addGoodsClick() {
      // 先进行form表单的验证
      this.$refs.addFormRef.validate(async (res) => {
        if (!res) {
          return this.$message.error('缺少数据')
        }
        // 发送请求
        // console.log(this.addForm)
        // 先对goods_cat 数据进行join
        // 进行深拷贝，goods_cat双向绑定于级联选择器
        let form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join()
        // 处理动态参数
        this.manyTableList.forEach((item) => {
          let info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(info)
        })
        // 处理静态属性
        this.onlyTableList.forEach((item) => {
          let info = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(info)
        })
        // 给深拷贝的赋值
        form.attrs = this.addForm.attrs

        console.log(form)
        let { data } = await this.$http.post('goods', form)
        if (data.meta.status !== 201) {
          this.$message.error(data.meta.msg)
        }
        // 跳转页面
        this.$router.push('/goods')
        this.$message.success(data.meta.msg)
      })
    },
  },
}
</script>
<style  scoped>
.el-checkbox {
  margin: 0 5px !important;
}

.onlyDataInput {
  width: 400px;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>