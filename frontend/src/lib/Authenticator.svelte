<script lang="ts">
    import { goto } from "@mateothegreat/svelte5-router";
    import { onMount, type Snippet } from "svelte";
    import { api } from "../utils";


    let { children } : { children: Snippet } = $props();

    onMount( async () => {

        await api({
            url: '/auth/me',
            method: "GET",
            withAuth: true,
            onSuccess: () => {},
            onFail: () =>  goto('/')
        })
    })

</script>

<div>
    {@render children?.()}
</div>

