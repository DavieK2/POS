<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
  import logo from '../assets/logo.jpg';
  import { BASE_URL } from "../utils";
  import { onMount } from "svelte";

  let showPassword = $state(false);
  let isLoading = $state(false);
  let username = $state("");
  let password = $state("");

  onMount( async() => {

      const token = localStorage.getItem("authToken");

      if(token){

          await fetch(`${BASE_URL}/auth/logout`, {
              method: "POST",
              headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ token
              }
          })

          localStorage.removeItem("authToken")
          localStorage.removeItem("user");
          localStorage.removeItem("loggedIn");

      }

  })

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    isLoading = true;

    const req = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            username,
            password
        }),
        headers:{
          'Content-Type': 'application/json'
        }
    })

    const res = await req.json()

    if( ! req.ok ){ 

      isLoading = false
      return;
    }

    if( ! res.token ) return;
    
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("authToken", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    
    
    if( res.user.role === "admin" ){
      goto('/dashboard');
    }else{
       goto('/pos');
    }

    isLoading = false;

  }
</script>

<div class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
  <div class="bg-white text-gray-900 flex flex-col gap-6 rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl shadow-gray-300/50">
    
    <!-- Header -->
    <div class="flex flex-col justify-center items-center px-8 pt-8 pb-2 text-center space-y-4">
     <div class="">
       <img class="h-20 w-20" src={logo} alt="">
     </div>
      <div class="space-y-1">
        <h1 class="text-xl font-bold tracking-tight">Vine POS</h1>
        <p class="text-gray-500 text-sm">Sign in to access your dashboard</p>
      </div>
    </div>
    
    <!-- Form -->
    <div class="px-8 pb-8">
      <form onsubmit={handleSubmit} class="space-y-5" novalidate>
        
        <!-- Username Field -->
        <div class="space-y-2">
          <label for="username" class="text-sm font-medium text-gray-700 block">Username</label>
          <input
            bind:value={username}
            autocomplete="off"
            type="text"
            id="username"
            placeholder="Enter your username"
            class="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>
        
        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700 block">Password</label>
          <div class="relative">
            <input
              bind:value={password}
              type={showPassword ? "text" : "password"}
              id="password"
              autocomplete="off"
              placeholder="Enter your password"
              class="w-full px-4 py-3 pr-11 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
            <button 
              type="button" 
              onclick={() => showPassword = !showPassword}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black rounded-lg p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabindex="-1"
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {/if}
            </button>
          </div>
        </div>
        
        <!-- Sign In Button -->
        <button 
          type="submit"
          disabled={isLoading}
          class="w-full py-3 px-4 bg-black text-white font-medium rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 flex items-center justify-center gap-2 cursor-pointer"
          aria-busy={isLoading}
        >
          {#if isLoading}
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>