/* 门店选品：沿用 MasterGo 192709608567050 / 455:44578 的页面结构。
 * 样式复用；业务按本次确认规则，示例商品为脱敏数据。
 */
let storeSubcategory='全部';
const storeGroups={P001:'饮用水',P002:'饮用水',P003:'饼干',P004:'卤味',P005:'气泡水',P006:'纸品'};
const storePhotos={P001:'store-water.png',P002:'store-water.png',P003:'store-biscuit.png',P006:'store-tissue.png',P004:'store-egg.png',P005:'store-lemon.png'};
function storeIcon(name){return `<img class="store-icon" alt="" src="assets/${name}.svg">`}
function pickStoreCategory(value){category=value;storeSubcategory='全部';render()}
function storeSelect(id){selected.has(id)?selected.delete(id):selected.add(id);render()}
function storeIncrement(id){qty[id]??=1;if(selected.has(id))qty[id]++;else selected.add(id);render()}
function storeDecrement(id){if(qty[id]>1){qty[id]--;render();return}modal('删除商品','数量调为0将删除该推荐商品，是否确认？无需填写原因。',`<button class="primary" onclick="rows.find(r=>r.id===${id}).s='已删除';selected.delete(${id});closeModal();render()">确认删除</button>`)}
function storeQuantity(id,value){const number=Number(value);if(!Number.isInteger(number)||number<0){toast('请输入有效整数数量');render();return}if(number===0){storeDecrementAtZero(id);return}qty[id]=number;selected.add(id);render()}
function storeDecrementAtZero(id){modal('删除商品','数量调为0将删除该推荐商品，是否确认？取消后保留原数量。',`<button class="primary" onclick="rows.find(r=>r.id===${id}).s='已删除';selected.delete(${id});closeModal();render()">确认删除</button>`);render()}
function storePage(){
  if(order)return orderPage();
  const t=tasks[0],all=taskRows(t).filter(r=>r.s==='待补货');
  all.forEach(r=>qty[r.id]??=1);
  const active=t.phase==='store';
  const family=all.filter(r=>category==='全部'||r.g[4]===category);
  const groups=['全部',...new Set(family.map(r=>storeGroups[r.g[0]]))];
  const visible=family.filter(r=>storeSubcategory==='全部'||storeGroups[r.g[0]]===storeSubcategory);
  const chosen=all.filter(r=>selected.has(r.id)),amount=chosen.reduce((sum,r)=>sum+qty[r.id]*r.g[3],0);
  return `<div class="mobile-wrap store-redesign"><div class="phone store-phone">
    <div class="store-status"><span>9:41</span><span class="store-device-note">APP 演示</span></div>
    <div class="store-title"><button aria-label="返回门店订单" onclick="toast('返回既有门店订单入口（演示）')">${storeIcon('back')}</button><strong>门店选品</strong><span>${esc(t.store)}</span></div>
    <div class="store-notice">${storeIcon('info')}<span>${active?(all.length?`您有${all.length}个待补货商品需确认，请及时完成下单！`:'本批推荐商品已全部处理完成。'):'当前补货任务已超期，无法继续处理。'}</span></div>
    <div class="store-tabs">${['全部','水饮','零食','日用品'].map(c=>`<button class="${category===c?'active':''}" onclick="pickStoreCategory('${c}')">${c}</button>`).join('')}</div>
    <div class="store-catalog"><aside class="store-sidebar">${groups.map(c=>`<button class="${storeSubcategory===c?'active':''}" onclick="storeSubcategory='${c}';render()">${c}</button>`).join('')}</aside><div class="store-items">
    <div class="store-list-title">${storeSubcategory}<small>${visible.length}个商品</small></div>
    ${active?visible.map(r=>`<article class="store-item"><div class="store-item-main"><div class="store-photo">${storePhotos[r.g[0]]?`<img alt="${esc(r.g[1])}" src="assets/${storePhotos[r.g[0]]}">`:`<span>${esc(r.g[1])}</span>`}</div><div class="store-item-info"><h4>${esc(r.g[1])}</h4><span class="store-item-tag">推荐商品</span><p>规格：标准配送规格</p><div class="store-price-row"><span class="store-price">¥<b>${r.g[3].toFixed(2)}</b><small>/件</small></span><div class="store-stepper">${selected.has(r.id)?`<button class="minus" aria-label="减少${r.g[1]}" onclick="storeDecrement(${r.id})">${storeIcon('minus')}</button><input aria-label="${r.g[1]}数量" type="number" min="0" value="${qty[r.id]}" onchange="storeQuantity(${r.id},this.value)">`:''}<button class="plus" aria-label="${selected.has(r.id)?'增加':'添加'}${r.g[1]}" onclick="storeIncrement(${r.id})">${storeIcon('plus')}</button></div></div></div></div><div class="store-item-metrics"><span>14日均销 <b>3.00</b></span><span>库存 <b>12.00</b></span><span>在途数量 <b>0.00</b></span><span>中心库存 <b>200.00</b></span></div></article>`).join('')||'<p class="store-empty">当前分类暂无待补货商品</p>':'<p class="store-empty">当前任务只读</p>'}
    </div></div>
    <div class="store-checkout"><div class="store-total"><div class="store-price">¥<b>${amount.toFixed(2)}</b></div><small>已选 ${chosen.reduce((sum,r)=>sum+qty[r.id],0)} 件 <button onclick="selected=allStoreSelected()?new Set():new Set(taskRows(tasks[0]).filter(r=>r.s==='待补货').map(r=>r.id));render()" ${!active?'disabled':''}>${all.length&&chosen.length===all.length?'取消全选':'全选'}</button></small></div><button class="store-delete" ${!active||!chosen.length?'disabled':''} onclick="deleteStore()">批量删除</button><button class="store-submit" ${!active||!chosen.length?'disabled':''} onclick="makeOrder()">生成订单</button></div>
    <nav class="store-navigation">${[['grid','分类'],['bookmark','缺品补单'],['cart','采购车'],['clipboard','订单']].map(([icon,label])=>`<button class="${icon==='bookmark'?'active':''}" onclick="${icon==='bookmark'?"pickStoreCategory('全部')":`toast('${label}沿用现有页面，本原型演示缺品补单')`}">${storeIcon(icon)}<span>${label}</span></button>`).join('')}</nav><div class="store-home"><span></span></div>
  </div><section class="store-design-notes"><h2>门店补货操作</h2><p>沿用已上线门店选品的标题、提醒条、横向分类、侧栏、商品行及底部操作区。示例图片和数据已脱敏。</p><p>点击加号选品，初始数量为1；选中后可调整数量。数量调为0按删除确认处理。</p><p>批量删除无需填写原因；生成订单后进入订单详情并提示保存成功。</p><p>已处理 ${storeDone(t)} / ${taskRows(t).length}</p><div class="toolbar"><button onclick="expireStore()">演示补货期结束</button></div></section></div>`;
}
function allStoreSelected(){const a=taskRows(tasks[0]).filter(r=>r.s==='待补货');return a.length&&a.every(r=>selected.has(r.id))}
const beforeStoreVisualRender=render;
render=function(){beforeStoreVisualRender();const phone=document.querySelector('.store-phone');if(phone&&typeof innerHeight==='number')phone.style.zoom=Math.min(1,Math.max(.55,(innerHeight-130)/812))};
if(typeof window!=='undefined')window.addEventListener('resize',()=>{if(page==='store')render()});
render();
