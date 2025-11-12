<template>
  <div class="route-planner">
    <Nav />
    
    <!-- 返回按鈕 -->
    <div class="header-section">
      <button class="back-button" @click="goBack">
        <i class="fas fa-arrow-left"></i>
        <span>返回景點庫</span>
      </button>
    </div>
    
    <!-- 主要內容 -->
    <main class="main-content">
      <!-- 地圖容器 -->
      <div class="map-container">
        <div id="map" ref="mapContainer"></div>
        
        <!-- 載入中覆蓋層 -->
        <div v-if="isLoading" class="map-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在規劃路線...</p>
        </div>
      </div>

      <!-- 路線資訊卡片 -->
      <div class="route-info-card">
        <h2 class="route-title">
          <i class="fas fa-route"></i>
          路線規劃
        </h2>
        
        <!-- 景點列表 -->
        <div class="waypoints-list">
          <div 
            v-for="(waypoint, index) in waypoints" 
            :key="waypoint.id"
            class="waypoint-item"
          >
            <div class="waypoint-marker">{{ index + 1 }}</div>
            <div class="waypoint-info">
              <h3 class="waypoint-name">{{ waypoint.name || '載入中...' }}</h3>
              <p class="waypoint-coords" v-if="waypoint.latitude && waypoint.longitude">
                {{ waypoint.latitude.toFixed(4) }}, {{ waypoint.longitude.toFixed(4) }}
              </p>
              <p class="waypoint-error" v-else-if="waypoint.error">
                無法取得座標
              </p>
            </div>
          </div>
        </div>

        <!-- 路線統計 -->
        <div v-if="routeStats" class="route-stats">
          <div class="stat-item">
            <i class="fas fa-map-marked-alt"></i>
            <span class="stat-label">總距離</span>
            <span class="stat-value">{{ routeStats.distance }} 公里</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-clock"></i>
            <span class="stat-label">預計時間</span>
            <span class="stat-value">{{ routeStats.duration }} 分鐘</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Nav from '@/components/views/nav.vue';
import { callAPI } from '@/utility/apiConfig';
import { Log } from '@/utility/logger';

// 設置 Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

const route = useRoute();
const router = useRouter();

// 地圖相關
const mapContainer = ref(null);
let map = null;

// 狀態
const isLoading = ref(true);
const waypoints = ref([]);
const routeStats = ref(null);

// 從路由參數取得景點 IDs
const attractionIds = ref([]);

// 初始化地圖
const initMap = () => {
  if (!mapContainer.value) return;

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [121.5654, 25.0330], // 台北預設中心
    zoom: 12
  });

  map.on('load', () => {
    Log.msg('RoutePlanner', '地圖載入完成');
  });
};

// 取得景點座標
const fetchCoordinates = async () => {
  if (attractionIds.value.length === 0) {
    Log.msg('RoutePlanner', '沒有景點 ID');
    isLoading.value = false;
    return;
  }

  try {
    // 建立查詢參數
    const queryParams = attractionIds.value.map(id => `ids=${id}`).join('&');
    
    const coords = await callAPI({
      method: 'GET',
      url: `/attractions/batch/coords?${queryParams}`,
      funcName: 'fetchCoordinates'
    });

    if (Array.isArray(coords)) {
      // 先用座標資料建立初始的 waypoints
      waypoints.value = coords.map(coord => ({
        id: coord.id,
        name: '載入中...',
        latitude: coord.latitude,
        longitude: coord.longitude,
        error: !coord.latitude || !coord.longitude
      }));

      Log.msg('RoutePlanner', `取得 ${waypoints.value.length} 個景點座標`);
      
      // 並行取得所有景點的詳細資訊
      await fetchAttractionDetails();
      
      // 繪製路線
      await drawRoute();
    }
  } catch (error) {
    Log.error('API 錯誤', '取得座標失敗', error);
  } finally {
    isLoading.value = false;
  }
};

// 取得景點詳細資訊
const fetchAttractionDetails = async () => {
  try {
    // 並行請求所有景點的詳細資訊
    const detailPromises = waypoints.value.map(waypoint => 
      callAPI({
        method: 'GET',
        url: `/attractions/${waypoint.id}`,
        funcName: 'fetchAttractionDetail'
      }).catch(error => {
        Log.error('API 錯誤', `取得景點 ${waypoint.id} 詳細資訊失敗`, error);
        return null;
      })
    );

    const details = await Promise.all(detailPromises);

    // 更新景點名稱
    waypoints.value = waypoints.value.map((waypoint, index) => {
      const detail = details[index];
      return {
        ...waypoint,
        name: detail?.name || '未知景點'
      };
    });

    Log.msg('RoutePlanner', '景點詳細資訊載入完成');
  } catch (error) {
    Log.error('API 錯誤', '取得景點詳細資訊失敗', error);
  }
};

// 繪製路線
const drawRoute = async () => {
  if (!map) return;

  // 過濾出有效的座標點
  const validWaypoints = waypoints.value.filter(
    wp => wp.latitude && wp.longitude
  );

  if (validWaypoints.length === 0) {
    Log.msg('RoutePlanner', '沒有有效的座標點');
    return;
  }

  // 添加標記
  validWaypoints.forEach((waypoint, index) => {
    // 創建自訂標記元素
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.textContent = index + 1;
    el.style.backgroundColor = index === 0 ? '#4caf50' : (index === validWaypoints.length - 1 ? '#f44336' : '#FF6B6B');
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.color = 'white';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '14px';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(el)
      .setLngLat([waypoint.longitude, waypoint.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${waypoint.name}</h3>`)
      )
      .addTo(map);
  });

  // 如果只有一個點，直接居中顯示
  if (validWaypoints.length === 1) {
    map.flyTo({
      center: [validWaypoints[0].longitude, validWaypoints[0].latitude],
      zoom: 14
    });
    return;
  }

  // 使用 Mapbox Directions API 取得路線
  try {
    const coordinates = validWaypoints
      .map(wp => `${wp.longitude},${wp.latitude}`)
      .join(';');

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // 計算路線統計
      routeStats.value = {
        distance: (route.distance / 1000).toFixed(2), // 轉換為公里
        duration: Math.round(route.duration / 60) // 轉換為分鐘
      };

      // 添加路線圖層
      if (map.getSource('route')) {
        map.getSource('route').setData(route.geometry);
      } else {
        map.addSource('route', {
          type: 'geojson',
          data: route.geometry
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6B6B',
            'line-width': 5,
            'line-opacity': 0.8
          }
        });
      }

      // 調整地圖視野以包含所有點
      const bounds = new mapboxgl.LngLatBounds();
      validWaypoints.forEach(wp => {
        bounds.extend([wp.longitude, wp.latitude]);
      });
      
      map.fitBounds(bounds, {
        padding: 50
      });

      Log.msg('RoutePlanner', '路線繪製完成');
    }
  } catch (error) {
    Log.error('路線規劃錯誤', '無法取得路線', error);
  }
};

// 返回景點庫
const goBack = () => {
  router.push('/attraction');
};

// 組件掛載
onMounted(async () => {
  // 從路由查詢參數取得景點 IDs
  const ids = route.query.ids;
  
  if (ids) {
    attractionIds.value = Array.isArray(ids) ? ids : [ids];
    Log.msg('RoutePlanner', `接收到 ${attractionIds.value.length} 個景點 ID`);
  } else {
    Log.msg('RoutePlanner', '沒有接收到景點 ID，返回上一頁');
    router.push('/attraction');
    return;
  }

  // 初始化地圖
  initMap();

  // 取得座標並繪製路線
  await fetchCoordinates();
});

// 組件卸載
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
@import '@/assets/main.css';

.route-planner {
  min-height: 100vh;
  background: var(--bg-cream);
  display: flex;
  flex-direction: column;
}

/* 頂部區域 */
.header-section {
  padding: 16px;
  background: var(--bg-cream);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bg-white);
  color: var(--text-brown);
  border: 2px solid var(--accent-coral);
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Sans TC', sans-serif;
  box-shadow: var(--shadow-light);
}

.back-button:hover {
  background: var(--accent-coral);
  color: white;
  transform: translateX(-4px);
  box-shadow: var(--shadow-medium);
}

.back-button:active {
  transform: translateX(-2px);
}

.back-button i {
  font-size: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 24px 16px;
}

/* 地圖容器 */
.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: var(--radius-large);
  overflow: hidden;
  box-shadow: var(--shadow-medium);
}

#map {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
}

.map-loading i {
  font-size: 32px;
  color: var(--accent-coral);
}

.map-loading p {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-brown);
}

/* 路線資訊卡片 */
.route-info-card {
  background: var(--bg-white);
  border-radius: var(--radius-large);
  padding: 20px;
  box-shadow: var(--shadow-medium);
  width: 100%;
}

.route-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  display: flex;
  align-items: center;
  gap: 10px;
}

.route-title i {
  color: var(--accent-coral);
}

/* 景點列表 */
.waypoints-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.waypoint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-cream);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.waypoint-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-light);
}

.waypoint-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-coral);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: var(--shadow-light);
}

.waypoint-item:first-child .waypoint-marker {
  background: #4caf50;
}

.waypoint-item:last-child .waypoint-marker {
  background: #f44336;
}

.waypoint-info {
  flex: 1;
  min-width: 0;
}

.waypoint-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-brown);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waypoint-coords {
  font-size: 14px;
  color: var(--text-gray);
  margin: 0;
  font-family: 'Courier New', monospace;
}

.waypoint-error {
  font-size: 14px;
  color: #f44336;
  margin: 0;
  font-style: italic;
}

/* 路線統計 */
.route-stats {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 2px solid var(--border-light);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-cream);
  border-radius: 12px;
  text-align: center;
}

.stat-item i {
  font-size: 24px;
  color: var(--accent-coral);
}

.stat-label {
  font-size: 14px;
  color: var(--text-gray);
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  color: var(--text-brown);
  font-weight: 700;
}

/* 響應式設計 */
@media (min-width: 768px) {
  .map-container {
    height: 500px;
  }

  .main-content {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .map-container {
    height: 600px;
  }
}
</style>
