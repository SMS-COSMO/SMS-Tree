<template>
  <el-space :size="20" direction="vertical" fill style="width: 100%;">
    <div style="width: 100%;">
      <el-carousel trigger="click" height="250px">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3 class="small justify-center" text="2xl">{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
    </div>

    <el-row>
      <el-card class="bordered-card">
        <template #header>
          快速搜索
        </template>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button style="width: 100%;" color="#146E3C" plain>
              <el-icon :size="14">
                <Search />
              </el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-row>
  </el-space>
  <FooterBar />
</template>

<style lang="scss" scoped>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

//Place Holder Style
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 250px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
