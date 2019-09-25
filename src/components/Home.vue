<template>
  <el-container class="home_container">
    <el-header>
      <div class="logo">
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_menu" @click="toggleCollapse">|||</div>
        <el-menu  background-color="#333744" text-color="#fff" active-text-color="blue" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 这个index只接收字符串值，数字和字符串拼接变成字符串 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveItem(subitem.path)">
             <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
             </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>   
</template>
<script>
export default {
  //在生命周期钩子函数当中代码量太多了 类似window.onload
  // 在页面一加载的时候就应该获取菜单 , 页面一加载生命周期钩子函数就会执行
  created: function() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('path')
  },
  data () {
    return {
      // 为了将数据渲染到页面，所以需要将获取到的数据挂在到data中
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods:{
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      var {data: res} = await this.$http.get('menus')
      // console.log(res)
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveItem(path) {
      window.sessionStorage.setItem('path', '/' + path)
    }
 
  }
}
</script>
<style lang='less' scoped>
  .home_container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #fff;
    >.logo {
      display: flex;
      align-items: center;
    }
  }
  .el-aside {
    background-color: rgb(51, 55, 68);
  }
  .el-main {
    background-color: rgb(234, 237, 241);
  }
  .el-menu {
    border-right: none;
  }
  .toggle_menu {
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .iconfont {
    padding-right: 10px;
  }
</style>