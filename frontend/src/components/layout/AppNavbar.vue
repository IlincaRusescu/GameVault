<template>
  <header class="navbar">
    <div class="brand">GameVault</div>
    <nav class="links">
      <RouterLink to="/games">Games</RouterLink>
      <RouterLink to="/sessions">Sessions</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
  </header>
</template>

<script setup></script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
}
.brand {
  font-weight: 700;
}
.links {
  display: flex;
  gap: 12px;
}
a {
  text-decoration: none;
  color: inherit;
}
a.router-link-active {
  font-weight: 700;
}
</style>
