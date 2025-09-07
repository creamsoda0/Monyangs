Set WshShell = CreateObject("WScript.Shell")

' 1. hta 실행 (비동기)
WshShell.Run "mshta.exe ""E:\moabayo\Moenyangs.hta""", 0, False

' 2. 배치 실행 (숨김 모드, 동기 실행: 끝날 때까지 기다림)
WshShell.Run """E:\moabayo\Moenyangs.bat""", 0, True

Do Until oExec.StdOut.AtEndOfStream
    line = oExec.StdOut.ReadLine
    ' CSV 포맷에서 창 제목(column 9)이 MoabayoHTA 인지 체크
    If InStr(line, "MoabayoHTA") > 0 Then
        fields = Split(line, ",")

        ' PID는 두 번째 컬럼 (index 1), 따옴표 제거
        htaPID = Replace(fields(1), """", "")
        Exit Do
    End If
Loop

If htaPID <> "" Then
    WshShell.Run "taskkill /PID " & htaPID & " /F", 0, True
End If

Set WshShell = Nothing