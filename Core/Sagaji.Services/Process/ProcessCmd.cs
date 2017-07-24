using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Process
{
    internal class ProcessCmd
    {
        internal static bool Shell(string command, string[] args)
        {
            bool isSuccess = false;
            try
            {
                System.Diagnostics.Process process = new System.Diagnostics.Process();
                System.Diagnostics.ProcessStartInfo startInfo = new System.Diagnostics.ProcessStartInfo();
                startInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
                startInfo.FileName = command;
                startInfo.Arguments = args.Select(x => string.Format(" {0}", x)).ToString();
                process.StartInfo = startInfo;
                process.Start();
                process.WaitForExit();
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("{0}:{1}", command, ex.Message));
            }
            return isSuccess;
        }

        public static bool ExecuteSqlScript(string fileDatabase, string script)
        {
            string commad = "sqlite3.exe";

            if (File.Exists(fileDatabase))
            {
                File.Delete(fileDatabase);
            }

            var result = Shell(commad, new string[] { fileDatabase, "-init", script }) && File.Exists(fileDatabase);

            return result;
        }


    }
}
