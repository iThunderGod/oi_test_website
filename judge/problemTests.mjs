export const problemTests = {
  A0101: [
    { name: '样例', score: 30, input: '5\n3 -2 9 4 1\n', output: '-2 9 15\n' },
    { name: '单日记录', score: 30, input: '1\n-7\n', output: '-7 -7 -7\n' },
    { name: '正负混合', score: 40, input: '6\n1000 -1000 0 5 -5 10\n', output: '-1000 1000 10\n' },
  ],
  A0102: [
    { name: '样例', score: 30, input: '6\n100 84 59 60 30 90\n', output: '2 2 2\n' },
    { name: '边界分数', score: 30, input: '3\n60 85 0\n', output: '1 1 1\n' },
    { name: '多段统计', score: 40, input: '8\n59 60 61 84 85 99 0 100\n', output: '2 3 3\n' },
  ],
  A0103: [
    { name: '闰年跨月', score: 30, input: '2024 2 27 3\n', output: '2024 3 1\n' },
    { name: '跨年', score: 30, input: '2023 12 31 1\n', output: '2024 1 1\n' },
    { name: '整年推进', score: 40, input: '1999 1 1 365\n', output: '2000 1 1\n' },
  ],
  A0201: [
    { name: '样例', score: 30, input: '8\n1 1 0 1 1 1 0 1\n', output: '3\n' },
    { name: '没有打卡', score: 30, input: '5\n0 0 0 0 0\n', output: '0\n' },
    { name: '全勤', score: 40, input: '7\n1 1 1 1 1 1 1\n', output: '7\n' },
  ],
  A0202: [
    { name: '样例', score: 30, input: '5 6\n1 2 3 3 0\n', output: '3\n' },
    { name: '包含重复零', score: 30, input: '4 0\n-1 0 1 0\n', output: '2\n' },
    { name: '递增数组', score: 40, input: '6 9\n1 2 3 4 5 6\n', output: '3\n' },
  ],
  A0203: [
    { name: '样例', score: 30, input: '5 5 2 2\nNNEESW\n', output: '2 3\n' },
    { name: '全部越界', score: 30, input: '2 2 1 1\nWWWNN\n', output: '1 1\n' },
    { name: '边界移动', score: 40, input: '3 4 3 4\nNNWSSSE\n', output: '3 4\n' },
  ],
  A0301: [
    { name: '样例', score: 30, input: '5\n5 1 4 1 3\n', output: '1 1 3 4 5\n' },
    { name: '单个元素', score: 30, input: '1\n42\n', output: '42\n' },
    { name: '负数与重复', score: 40, input: '6\n0 -3 7 -3 2 2\n', output: '-3 -3 0 2 2 7\n' },
  ],
  A0302: [
    { name: '样例', score: 30, input: '5 4\n1 3 3 7 9\n0 3 8 10\n', output: '1\n2\n5\n-1\n' },
    { name: '普通下界', score: 30, input: '3 3\n2 4 6\n1 6 7\n', output: '1\n3\n-1\n' },
    { name: '重复元素', score: 40, input: '4 4\n5 5 5 8\n5 6 8 9\n', output: '1\n4\n4\n-1\n' },
  ],
  A0303: [
    { name: '样例', score: 30, input: '3 7\n5 8 10\n', output: '2\n' },
    { name: '不可切出', score: 30, input: '2 10\n3 4\n', output: '0\n' },
    { name: '答案二分', score: 40, input: '4 5\n9 7 5 3\n', output: '3\n' },
  ],
  A0401: [
    { name: '样例', score: 30, input: '4\n1 3\n2 5\n4 6\n6 7\n', output: '3\n' },
    { name: '首尾相接', score: 30, input: '3\n1 2\n2 3\n3 4\n', output: '3\n' },
    { name: '舍弃长区间', score: 40, input: '5\n1 10\n2 3\n3 4\n4 5\n5 6\n', output: '4\n' },
  ],
  A0402: [
    { name: '样例', score: 30, input: '286\n', output: '8\n' },
    { name: '零金额', score: 30, input: '0\n', output: '0\n' },
    { name: '大金额', score: 40, input: '999\n', output: '19\n' },
  ],
  A0403: [
    { name: '样例', score: 30, input: '25 10 4\n10 10\n14 5\n20 10\n21 1\n', output: '2\n' },
    { name: '无法到达', score: 30, input: '10 3 1\n4 10\n', output: '-1\n' },
    { name: '多站选择', score: 40, input: '100 50 4\n25 25\n50 25\n75 25\n90 20\n', output: '2\n' },
  ],
  A0501: [
    { name: '样例', score: 30, input: '5 3\n1 2 3 4 5\n1 3\n2 5\n4 4\n', output: '6\n14\n4\n' },
    { name: '单点区间', score: 30, input: '1 2\n-5\n1 1\n1 1\n', output: '-5\n-5\n' },
    { name: '大整数答案', score: 40, input: '4 2\n1000000000 1000000000 1000000000 1000000000\n1 4\n2 3\n', output: '4000000000\n2000000000\n' },
  ],
  A0502: [
    { name: '样例', score: 30, input: '5 3\n1 3 2\n2 5 1\n4 4 -3\n', output: '2 3 3 -2 1\n' },
    { name: '局部修改', score: 30, input: '4 1\n2 3 5\n', output: '0 5 5 0\n' },
    { name: '正负叠加', score: 40, input: '3 3\n1 3 10\n1 1 -2\n3 3 -5\n', output: '8 10 5\n' },
  ],
  A0503: [
    { name: '样例', score: 30, input: '3 3 2\n1 2 3\n4 5 6\n7 8 9\n1 1 2 2\n2 2 3 3\n', output: '12\n28\n' },
    { name: '单行矩阵', score: 30, input: '1 3 2\n5 -1 2\n1 1 1 3\n1 2 1 2\n', output: '6\n-1\n' },
    { name: '边界子矩形', score: 40, input: '2 2 3\n1 2\n3 4\n1 1 2 2\n1 2 2 2\n2 1 2 1\n', output: '10\n6\n3\n' },
  ],
  A0601: [
    { name: '样例', score: 30, input: '3 4\nS..#\n.#..\n...T\n', output: '5\n' },
    { name: '无法到达', score: 30, input: '2 2\nS#\n#T\n', output: '-1\n' },
    { name: '单行迷宫', score: 40, input: '1 5\nS...T\n', output: '4\n' },
  ],
  A0602: [
    { name: '样例', score: 30, input: '3 5\n11000\n01011\n00101\n', output: '3\n' },
    { name: '没有陆地', score: 30, input: '2 3\n000\n000\n', output: '0\n' },
    { name: '对角不连通', score: 40, input: '3 3\n101\n010\n101\n', output: '5\n' },
  ],
  A0603: [
    { name: '样例', score: 30, input: '8 8 1 1 8 8\n', output: '6\n' },
    { name: '起终点相同', score: 30, input: '1 1 1 1 1 1\n', output: '0\n' },
    { name: '无法移动', score: 40, input: '2 2 1 1 2 2\n', output: '-1\n' },
  ],
  A0701: [
    { name: '样例', score: 30, input: '5\n', output: '8\n' },
    { name: '第一级', score: 30, input: '1\n', output: '1\n' },
    { name: '第十级', score: 40, input: '10\n', output: '89\n' },
  ],
  A0702: [
    { name: '样例', score: 30, input: '4 7\n3 4\n4 5\n2 3\n5 7\n', output: '10\n' },
    { name: '全部超重', score: 30, input: '3 5\n6 10\n7 9\n8 8\n', output: '0\n' },
    { name: '组合最优', score: 40, input: '5 10\n2 4\n3 5\n4 10\n5 11\n9 13\n', output: '21\n' },
  ],
  A0703: [
    { name: '样例', score: 30, input: '8\n10 9 2 5 3 7 101 18\n', output: '4\n' },
    { name: '严格下降', score: 30, input: '5\n5 4 3 2 1\n', output: '1\n' },
    { name: '重复元素', score: 40, input: '7\n1 2 2 3 4 0 5\n', output: '5\n' },
  ],
  A0801: [
    { name: '样例', score: 30, input: '7\nPUSH 3\nPUSH 5\nFRONT\nSIZE\nPOP\nFRONT\nSIZE\n', output: '3\n2\n5\n1\n' },
    { name: '空队查询', score: 30, input: '5\nFRONT\nSIZE\nPUSH 9\nFRONT\nSIZE\n', output: 'EMPTY\n0\n9\n1\n' },
    { name: '连续出队', score: 40, input: '8\nPUSH 1\nPUSH 2\nPOP\nPUSH 3\nFRONT\nPOP\nFRONT\nSIZE\n', output: '2\n3\n1\n' },
  ],
  A0802: [
    { name: '样例', score: 30, input: '4\n()[]{}\n([)]\n{[()]}\n(()\n', output: 'YES\nNO\nYES\nNO\n' },
    { name: '右括号开头', score: 30, input: '3\n]\n[]{}\n[{()}]\n', output: 'NO\nYES\nYES\n' },
    { name: '未闭合与交叉', score: 40, input: '2\n((((\n{[}]\n', output: 'NO\nNO\n' },
  ],
  A0803: [
    { name: '样例', score: 30, input: '5 5\n5 4 3 2 1\n2 1 5\n1 3 10\n2 2 4\n1 5 0\n2 4 5\n', output: '1\n2\n0\n' },
    { name: '单点维护', score: 30, input: '1 3\n7\n2 1 1\n1 1 -5\n2 1 1\n', output: '7\n-5\n' },
    { name: '多次查询', score: 40, input: '4 4\n8 6 7 5\n2 1 2\n1 2 9\n2 2 4\n2 3 3\n', output: '6\n5\n7\n' },
  ],
  A0901: [
    { name: '样例', score: 30, input: '5 3\n1 2\n2 3\n4 5\n', output: '2 3\n' },
    { name: '无边图', score: 30, input: '4 0\n', output: '4 1\n' },
    { name: '两个大块', score: 40, input: '6 5\n1 2\n2 3\n4 5\n5 6\n4 6\n', output: '2 3\n' },
  ],
  A0902: [
    { name: '样例', score: 30, input: '4 4 1\n1 2 5\n1 3 2\n3 2 1\n2 4 3\n', output: '0 3 2 6\n' },
    { name: '不可达点', score: 30, input: '3 1 2\n2 3 7\n', output: '-1 0 7\n' },
    { name: '多路径比较', score: 40, input: '5 6 1\n1 2 2\n1 3 5\n2 3 1\n2 4 2\n3 5 1\n4 5 5\n', output: '0 2 3 4 4\n' },
  ],
  A0903: [
    { name: '样例', score: 30, input: '4 3\n1 2\n1 3\n3 4\n', output: '1 2 3 4\n' },
    { name: '有环', score: 30, input: '2 2\n1 2\n2 1\n', output: 'IMPOSSIBLE\n' },
    { name: '字典序选择', score: 40, input: '5 3\n1 4\n2 4\n3 5\n', output: '1 2 3 4 5\n' },
  ],
  A1001: [
    { name: '样例', score: 30, input: '12 18\n', output: '6 36\n' },
    { name: '互质', score: 30, input: '7 13\n', output: '1 91\n' },
    { name: '倍数关系', score: 40, input: '1000000000 500000000\n', output: '500000000 1000000000\n' },
  ],
  A1002: [
    { name: '样例', score: 30, input: '2 10 1000\n', output: '24\n' },
    { name: '零指数', score: 30, input: '5 0 13\n', output: '1\n' },
    { name: '循环节', score: 40, input: '7 5 13\n', output: '11\n' },
  ],
  A1003: [
    { name: '样例', score: 30, input: '7 3\n1 2 3\n', output: '1 4 5\n' },
    { name: '小质数', score: 30, input: '5 4\n1 2 3 4\n', output: '1 3 2 4\n' },
    { name: '多个查询', score: 40, input: '11 3\n2 7 10\n', output: '6 8 10\n' },
  ],
  A1101: [
    { name: '样例', score: 30, input: 'abacaba\n', output: '4 2 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n' },
    { name: '单一字符', score: 30, input: 'zzz\n', output: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3\n' },
    { name: '稀疏分布', score: 40, input: 'abcxyz\n', output: '1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1\n' },
  ],
  A1102: [
    { name: '样例', score: 30, input: 'aba\nababa\n', output: '2\n' },
    { name: '重叠匹配', score: 30, input: 'aa\naaaa\n', output: '3\n' },
    { name: '无匹配', score: 40, input: 'abc\ndefgh\n', output: '0\n' },
  ],
  A1103: [
    { name: '样例', score: 30, input: '4 3\napple\napp\napt\nbee\nap\napp\nb\n', output: '3\n2\n1\n' },
    { name: '链式前缀', score: 30, input: '3 4\na\nab\nabc\na\nab\nabc\nb\n', output: '3\n2\n1\n0\n' },
    { name: '多个首字母', score: 40, input: '3 4\ncat\ncar\ndog\nca\nc\ndo\nz\n', output: '2\n2\n1\n0\n' },
  ],
}

export function getProblemTests(problemId) {
  return problemTests[problemId] || []
}
