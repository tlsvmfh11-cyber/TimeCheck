import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [roomNumber, setRoomNumber] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [period, setPeriod] = useState('오후') // 오전 or 오후
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState([])

  // 로컬스토리지에서 히스토리 불러오기
  useEffect(() => {
    const savedHistory = localStorage.getItem('timeHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 시간 계산 함수
  const calculateTime = () => {
    if (!roomNumber.trim() || !timeInput.trim()) {
      alert('방번호와 시간을 입력해주세요!')
      return
    }

    const timeNum = parseInt(timeInput)
    if (isNaN(timeNum) || timeNum < 0 || timeNum > 2359) {
      alert('올바른 시간을 입력해주세요 (예: 1036, 900)')
      return
    }

    let hours = Math.floor(timeNum / 100)
    const minutes = timeNum % 100

    if (minutes >= 60) {
      alert('분은 0~59 사이여야 합니다!')
      return
    }

    // AM/PM 처리
    if (period === '오후') {
      if (hours !== 12) {
        hours = (hours % 12) + 12
      }
    } else {
      // 오전
      if (hours === 12) {
        hours = 0
      }
    }

    // 시작 시간
    const startTime = formatTime(hours, minutes)

    // 반티 (+11분)
    const bantiTime = addMinutes(hours, minutes, 11)

    // 완티 (+31분)
    const wantiTime = addMinutes(hours, minutes, 31)

    const resultData = {
      roomNumber,
      startTime,
      bantiMinute: bantiTime.minutes.toString().padStart(2, '0'),
      wantiMinute: wantiTime.minutes.toString().padStart(2, '0'),
      timestamp: new Date().toLocaleString('ko-KR')
    }

    setResult(resultData)

    // 히스토리에 추가
    const newHistory = [resultData, ...history.slice(0, 9)] // 최근 10개만 저장
    setHistory(newHistory)
    localStorage.setItem('timeHistory', JSON.stringify(newHistory))
  }

  // 시간 포맷 함수
  const formatTime = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // 분 추가 함수
  const addMinutes = (hours, minutes, add) => {
    let totalMinutes = hours * 60 + minutes + add
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60
    return {
      hours: newHours,
      minutes: newMinutes,
      formatted: formatTime(newHours, newMinutes)
    }
  }

  // 카톡 복사용 텍스트 생성
  const generateKakaoText = () => {
    if (!result) return ''
    return `${result.roomNumber}
${result.startTime} 스타트

${result.bantiMinute}분 반티
${result.wantiMinute}분 완티`
  }

  // 클립보드 복사
  const copyToClipboard = async () => {
    const text = generateKakaoText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // 폴백: textarea 사용
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 초기화
  const reset = () => {
    setRoomNumber('')
    setTimeInput('')
    setResult(null)
  }

  // 히스토리 클릭
  const loadFromHistory = (item) => {
    setRoomNumber(item.roomNumber)
    setResult(item)
  }

  // 히스토리 삭제
  const clearHistory = () => {
    if (confirm('모든 히스토리를 삭제하시겠습니까?')) {
      setHistory([])
      localStorage.removeItem('timeHistory')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⏰ 시간 계산기</h1>
          <p className="text-gray-600 text-sm">반티/완티 자동 계산</p>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* 방번호 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              방번호
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="예: 101티"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* AM/PM 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              오전/오후
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setPeriod('오전')}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  period === '오전'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                오전
              </button>
              <button
                onClick={() => setPeriod('오후')}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  period === '오후'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                오후
              </button>
            </div>
          </div>

          {/* 시간 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              시간 입력 (숫자만)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="예: 1036"
              className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {period} + {timeInput || '____'} → {timeInput ? (() => {
                const hours = Math.floor(parseInt(timeInput) / 100)
                const minutes = parseInt(timeInput) % 100
                let displayHours = hours
                if (period === '오후' && hours !== 12) {
                  displayHours = (hours % 12) + 12
                } else if (period === '오전' && hours === 12) {
                  displayHours = 0
                }
                return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
              })() : '__:__'}
            </p>
          </div>

          {/* 계산 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={calculateTime}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
              계산하기
            </button>
            <button
              onClick={reset}
              className="px-6 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 결과 카드 */}
        {result && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-800">📋 카톡 복사용</h2>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-green-700 hover:bg-green-50'
                }`}
              >
                {copied ? '✓ 복사됨!' : '복사'}
              </button>
            </div>
            <div className="bg-white rounded-xl p-4 font-mono text-sm leading-relaxed whitespace-pre-line border-2 border-green-200">
              {generateKakaoText()}
            </div>
          </div>
        )}

        {/* 히스토리 */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">📜 최근 기록</h2>
              <button
                onClick={clearHistory}
                className="text-sm text-red-500 hover:text-red-700 font-semibold"
              >
                전체 삭제
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(item)}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{item.roomNumber}</div>
                    <div className="text-sm text-gray-600">
                      {item.startTime} 시작 · {item.bantiMinute}분 반티 · {item.wantiMinute}분 완티
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{item.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 사용 안내 */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
          <h3 className="font-bold mb-2">📌 사용방법</h3>
          <ul className="space-y-1 text-xs">
            <li>1. 방번호 입력</li>
            <li>2. 오전/오후 선택</li>
            <li>3. 시간을 숫자로 입력 (예: {period} + 1036 → {period === '오후' ? '22:36' : '10:36'})</li>
            <li>4. 계산하기 버튼 클릭</li>
            <li>5. 결과를 복사해서 카톡에 붙여넣기</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-blue-200 text-xs">
            <div className="text-green-700">✓ 반티 = 시작 + 11분</div>
            <div className="text-green-700">✓ 완티 = 시작 + 31분</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
