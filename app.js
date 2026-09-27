(() => {
  'use strict';
  const bands = {thanks:'ありがとう、のひと箱。',rest:'おつかれさま、のひと箱。',tea:'また、お茶しよう。'};
  const price = 1980, key = 'kogashi-biyori-cart-v1';
  const contact = document.querySelector('#contact-dialog'), cartDialog = document.querySelector('#cart-dialog');
  const quantity = document.querySelector('#quantity'), form = document.querySelector('#gift-form');
  const money = n => n.toLocaleString('ja-JP') + '円';
  const bandSection = document.querySelector('#message-bands');
  const orderSection = document.querySelector('#order');
  const bandStorageKey = 'kogashi-biyori-band-v1';
  const bandColors = {thanks:'オレンジ',rest:'ブルー',tea:'グリーン'};
  const bandInputs = [...document.querySelectorAll('input[name="message-band"], input[name="band"]')];
  function selectBand(band, persist = true) {
    if (!Object.hasOwn(bands, band)) return;
    bandSection.dataset.selectedBand = band;
    orderSection.dataset.selectedBand = band;
    bandInputs.forEach(input => { input.checked = input.value === band; });
    document.querySelector('[data-band-status]').textContent = `選択中：${bands[band]}`;
    document.querySelector('.band-photo').setAttribute('aria-label', `${bandColors[band]}の帯「${bands[band]}」で包んだ、こがし日和のギフトボックス。`);
    document.querySelector('[data-order-band-status]').textContent = `${bandColors[band]}｜${bands[band]}`;
    document.querySelector('.order-photo').setAttribute('aria-label', `${bandColors[band]}の帯「${bands[band]}」で包んだギフトボックスと、おそろいのカード。`);
    if (persist) { try { localStorage.setItem(bandStorageKey, band); } catch {} }
  }
  bandInputs.forEach(input => input.addEventListener('change', () => selectBand(input.value)));
  let initialBand = 'thanks';
  try { const savedBand = localStorage.getItem(bandStorageKey); if (Object.hasOwn(bands, savedBand)) initialBand = savedBand; } catch {}
  selectBand(initialBand, false);
  document.querySelector('[data-select-band]').addEventListener('click', () => {
    document.querySelector('#bands-title').focus({preventScroll:true});
    bandSection.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  let cart = [], previousFocus;
  try { const saved = JSON.parse(localStorage.getItem(key)); if (Array.isArray(saved)) cart = Object.keys(bands).flatMap(band => { const qty = saved.filter(i => i && i.band === band && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99).reduce((n,i) => n+i.qty,0);return qty ? [{band,qty:Math.min(qty,99)}] : []; }); } catch {}
  function save(){try{localStorage.setItem(key,JSON.stringify(cart));}catch{}}
  function openDialog(dialog,trigger=document.activeElement){if(trigger instanceof HTMLElement&&!trigger.closest('dialog')&&trigger!==document.body)previousFocus=trigger;dialog.showModal();dialog.querySelector('h2').focus();}
  [contact,cartDialog].forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))previousFocus?.focus();});
  });
  function totalQuantity(){return cart.reduce((n,i)=>n+i.qty,0);}
  function renderCart(){
    const count=totalQuantity(),badge=document.querySelector('.cart-count');
    badge.textContent=count;badge.hidden=!count;
    document.querySelector('[data-open-cart]').setAttribute('aria-label',`カートを開く、商品${count}点`);
    const container=document.querySelector('#cart-items');container.replaceChildren();
    if(!count){const empty=document.createElement('p');empty.className='empty-cart';empty.textContent='カートに商品はまだありません。贈る言葉を選んでみませんか。';container.append(empty);}
    for(const item of cart){
      const row=document.createElement('article');row.className='cart-item';
      row.innerHTML=`<h3>${bands[item.band]}</h3><p>こがし日和 ギフトボックス<br>3種類・6個入り／箱・カード付き</p><strong class="cart-item-price">${money(item.qty*price)}</strong><div class="cart-item-actions"><div class="stepper"><button type="button" data-action="minus" aria-label="${bands[item.band]}の数量を減らす" ${item.qty===1?'disabled':''}>−</button><output aria-label="数量">${item.qty}</output><button type="button" data-action="plus" aria-label="${bands[item.band]}の数量を増やす" ${item.qty===99?'disabled':''}>＋</button></div><button type="button" class="remove-button" data-action="remove" aria-label="${bands[item.band]}を削除">削除</button></div>`;
      row.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
        const action=button.dataset.action;
        if(action==='remove')cart=cart.filter(i=>i.band!==item.band);else item.qty=Math.max(1,Math.min(99,item.qty+(action==='plus'?1:-1)));
        save();renderCart();
        const nextRow=container.querySelectorAll('.cart-item')[Math.max(0,cart.findIndex(i=>i.band===item.band))];
        (nextRow?.querySelector(`[data-action="${action}"]:not(:disabled)`)||nextRow?.querySelector('button:not(:disabled)')||document.querySelector('#continue-choosing')).focus();
      }));container.append(row);
    }
    document.querySelector('#cart-total').textContent=money(count*price);
    document.querySelector('#cart-total-row').hidden=!count;
  }
  function renderQuantity(){const qty=quantity.valueAsNumber;document.querySelector('#subtotal').textContent=Number.isInteger(qty)&&qty>=1&&qty<=99?money(qty*price):'—';document.querySelector('.order-subtotal').hidden=qty===1;form.querySelector('[data-step="-1"]').disabled=qty<=1;form.querySelector('[data-step="1"]').disabled=qty>=99;}
  quantity.addEventListener('input',renderQuantity);
  quantity.addEventListener('change',()=>{quantity.value=Math.max(1,Math.min(99,Math.floor(Number(quantity.value)||1)));renderQuantity();});
  form.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{quantity.value=Math.max(1,Math.min(99,(Number(quantity.value)||1)+Number(button.dataset.step)));renderQuantity();}));
  function goToOrder(){document.querySelector('#order-title').focus({preventScroll:true});orderSection.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
  document.querySelector('[data-scroll-order]').addEventListener('click',goToOrder);
  const stickyBar=document.querySelector('.sticky-order-bar');
  const stickyTargets=[orderSection,document.querySelector('.site-footer')];
  const visibleTargets=new Set();
  const stickyObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){if(entry.isIntersecting)visibleTargets.add(entry.target);else visibleTargets.delete(entry.target);}
    stickyBar.hidden=visibleTargets.size>0;
  },{threshold:0});
  stickyTargets.forEach(target=>stickyObserver.observe(target));
  document.querySelector('[data-open-contact]').addEventListener('click',()=>openDialog(contact));
  document.querySelector('.contact-guide-link').addEventListener('click',()=>{previousFocus=null;contact.close();});
  document.querySelector('[data-shipping-link]').addEventListener('click',()=>{document.querySelector('#guide-truck').open=true;});
  document.querySelector('[data-open-cart]').addEventListener('click',()=>{document.querySelector('#cart-notice').textContent='';openDialog(cartDialog);});
  document.querySelector('#continue-choosing').addEventListener('click',()=>{previousFocus=document.querySelector('#order-title');cartDialog.close();goToOrder();});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const band=new FormData(form).get('band'),qty=quantity.valueAsNumber;if(!Object.hasOwn(bands,band)||!Number.isInteger(qty)||qty<1||qty>99)return;
    const existing=cart.find(i=>i.band===band);
    if(existing)existing.qty=Math.min(99,existing.qty+qty);else cart.push({band,qty});
    save();renderCart();document.querySelector('#cart-notice').textContent='カートに追加しました。';openDialog(cartDialog,document.querySelector('#order-submit'));
  });
  renderQuantity();renderCart();
})();
