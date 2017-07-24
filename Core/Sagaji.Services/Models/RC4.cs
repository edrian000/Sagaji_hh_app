using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    class RC4
    {
        string text;
        string key;

        public string Text
        {
            get { return text; }
            set
            {
                if (validate(value) && value.Length == 16)
                    text = combineByte(value);
                else
                    throw new FormatException("Invalid text value!");
            }
        }

        public string Key
        {
            set
            {
                if (validate(value) && value.Length == 14)
                    key = combineByte(value);
                else
                    throw new FormatException("Invalid key value!");
            }
        }

        private bool validate(string input)
        {
            for (int x = 0; x < input.Length; x++)
                if (!((input[x] >= '0' && input[x] <= '9') || (input[x] >= 'A' && input[x] <= 'F')))
                    return false;

            return true;
        }

        public void compute()
        {
            StringBuilder result = new StringBuilder();
            int x, y, j = 0;
            int[] perm = new int[256];

            for (int i = 0; i < 256; i++)
            {
                perm[i] = i;
            }

            for (int i = 0; i < 256; i++)
            {
                j = (key[i % key.Length] + perm[i] + j) % 256;
                x = perm[i];
                perm[i] = perm[j];
                perm[j] = x;
            }

            for (int i = 0; i < text.Length; i++)
            {
                y = i % 256;
                j = (perm[y] + j) % 256;
                x = perm[y];
                perm[y] = perm[j];
                perm[j] = x;

                result.Append((char)(text[i] ^ perm[(perm[y] + perm[j]) % 256]));
            }

            text = result.ToString();
        }

        private string combineByte(string input)
        {
            BitArray tempArray;

            byte[] hex = new byte[input.Length];

            for (int x = 0; x < hex.Length; x++)
            {
                int temp = input[x];

                if (temp >= '0' && temp <= '9')
                    temp -= '0';
                else if (temp >= 'A' && temp <= 'F')
                    temp -= '7';

                hex[x] = Convert.ToByte(temp);
            }

            tempArray = new BitArray(hex);
            int pos = 0, count = 0, size = hex.Length * 4;
            bool[] bData = new bool[size];

            for (int x = 0; ((pos + 1) * 4) + x < tempArray.Length; x++)
            {
                if (x % 4 == 0 && x > 3)
                {
                    pos += 2;
                    x = 0;
                }

                bData[count++] = tempArray[(pos * 4) + x];
            }

            tempArray = new BitArray(bData);
            int[] num = new int[8];
            StringBuilder sb = new StringBuilder();

            for (int x = 0; x <= tempArray.Length; x++)
            {
                if (x % 8 == 0 && x != 0)
                    sb.Append((char)calcNum(num));

                if (x < tempArray.Length)
                    num[x % 8] = Convert.ToInt16(tempArray[x]);
            }

            return sb.ToString();
        }

        private int calcNum(int[] num)
        {
            int sum = 0;

            for (int x = 0; x < num.Length; x++)
                if (num[x] == 1)
                    sum += (int)Math.Pow(2, x);

            return sum;
        }

        public override string ToString()
        {
            BitArray tempArray;
            StringBuilder result = new StringBuilder();
            byte[] hex = new byte[text.Length];

            for (int x = 0; x < hex.Length; x++)
                hex[x] = Convert.ToByte(text[x]);

            tempArray = new BitArray(hex);
            int[] num = new int[4];

            for (int x = 0; x < tempArray.Length; x++)
            {
                if (x % 4 == 0 && x != 0)
                    result.Append(hexValue(num));

                num[x % 4] = Convert.ToInt16(tempArray[x]);
            }

            result.Append(hexValue(num));

            return result.ToString();
        }

        private char hexValue(int[] num)
        {
            int value = calcNum(num);

            if (value > 9)
                return (char)('A' + (value - 10));
            else
                return (char)('0' + value);
        }
    }
}
