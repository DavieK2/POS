<script lang="ts">
  import { goto } from "@mateothegreat/svelte5-router";
  import { onMount, type Snippet } from "svelte";


    let { children } : { children: Snippet } = $props();

    let isAuthenticated = sessionStorage.getItem("login");

    onMount(() => {

        if( isAuthenticated === "false" ){
            goto('/')
        }

        // setTimeout(() =>  sessionStorage.setItem("login", "false"), 5000 )

    })

</script>

<div>
    {@render children?.()}
</div>

