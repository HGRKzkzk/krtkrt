<script lang="ts">
  export let name = '';
  export let image = '';
  export let size: 'small'|'medium'|'large' = 'small';
  $: initials = (name.trim().replace(/\s*\(voorbeeld\)\s*/i,'').split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]?.toLocaleUpperCase('nl-NL')).join('')) || '?';
  $: safeImage = typeof image === 'string' && /^data:image\/jpeg;base64,/.test(image) && image.length < 130000 ? image : '';
</script>

<span class:medium={size === 'medium'} class:large={size === 'large'} class="avatar" aria-label={name ? 'Profielfoto van ' + name : 'Profielafbeelding'}>
  {#if safeImage}
    <img src={safeImage} alt="" />
  {:else}
    <span aria-hidden="true">{initials}</span>
  {/if}
</span>

<style>
  .avatar{display:inline-flex;width:35px;height:35px;border-radius:50%;flex:none;align-items:center;justify-content:center;overflow:hidden;background:#e6ece7;color:#41604d;border:1px solid #d2ddd5;font-weight:600;font-size:12px;line-height:1}
  .avatar.medium{width:48px;height:48px;font-size:15px}
  .avatar.large{width:92px;height:92px;font-size:28px}
  .avatar img{display:block;width:100%;height:100%;object-fit:cover}
</style>