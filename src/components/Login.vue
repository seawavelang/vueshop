<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form class="login_form" :rules="loginFormRules" :model="loginForm" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-s-custom" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
   
  </div>
</template>
<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    resetLoginForm() {
      // console.log(this)
      // 重置功能用到ref,ref就是组件实例
      // 注意与resetField区分开，resetField用于单个表单项重置
      this.$refs.loginFormRef.resetFields()
    },
    // 点击登录进行表单验证
    login() {
      // console.log(this)
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if(!valid) return
        var {data: res} = await this.$http.post('login', this.loginForm)
        // console.log(res)
        if(res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang='less' scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
    .login_box {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 5px;
      transform: translate(-50%, -50%);
      .avatar {
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        box-shadow: 0 0 10px #ddd;
        padding: 10px;
        background-color: #fff;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #eee;
        }
      }
    }
  }
  .login_form {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
