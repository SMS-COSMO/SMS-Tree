<template>
  <div class="absolute inset-x-[20px] w-[calc(100vw-40px)] flex flex-row gap-4">
    <AdminNavBar />
    <div class="mb-5 w-full">
      <slot />
    </div>
  </div>
</template>
