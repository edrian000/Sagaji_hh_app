using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class SQLiteHelper
    {
        public static void CreateDbIfNotExists(string dbPath)
        {
            string directory = Path.GetDirectoryName(dbPath);

            if (File.Exists(dbPath))
            {
                File.Delete(dbPath);
            }

            // Creates directory if it doesn't already exist:
            //Directory.CreateDirectory(directory);

            // Creates file if it doesn't already exist:
            SQLiteConnection.CreateFile(dbPath);

            string _connectionString = string.Format("Data Source = {0}", dbPath);

            CreateTableCarteras(_connectionString);
            CreateTableClientes(_connectionString);
            CreateTableDomicilios(_connectionString);
            CreateTableCredentials(_connectionString);
            CreateTableEquivalencias(_connectionString);
            CreateTableExistencias(_connectionString);
            CreateTableProducts(_connectionString);
        }

        static SQLiteConnection CreateConnection(string _connectionString)
        {
            return new SQLiteConnection(_connectionString);
        }


        static void CreateTableProducts(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append("DROP TABLE IF EXISTS Productos;");
            builder.Append("CREATE TABLE IF NOT EXISTS Productos (codigo text primary key collate nocase, descripcion text collate nocase, precio text, unidad text, linea text);");
            builder.Append("CREATE INDEX idx_products on Productos (codigo, descripcion);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableEquivalencias(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append("DROP TABLE IF EXISTS Equivalencias;");
            builder.Append("CREATE TABLE IF NOT EXISTS Equivalencias (codigo text, codigoequiv text );");
            builder.Append("CREATE INDEX idx_equivalencias on Equivalencias (codigo, codigoequiv);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableExistencias(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();
            builder.Append("DROP TABLE IF EXISTS Existencias;");
            builder.Append("CREATE TABLE IF NOT EXISTS Existencias (codigo text, almacen text, existencia integer);");
            builder.Append("CREATE INDEX idx_existencias on Existencias (codigo, almacen);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableClientes(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();
            builder.Append("DROP TABLE IF EXISTS Clientes;");
            builder.Append("CREATE TABLE IF NOT EXISTS Clientes (cartera text not null, nocliente text primary key, nombre text, rfc text, domfiscal text , telefono text, credito real);");
            builder.Append("CREATE INDEX idx_clients on Clientes (cartera, nocliente);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableCarteras(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();
            builder.Append("DROP TABLE IF EXISTS Carteras;");
            builder.Append("CREATE TABLE IF NOT EXISTS Carteras (login text not null, cartera text not null);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableDomicilios(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append("DROP TABLE IF EXISTS Domicilios;");
            builder.Append("CREATE TABLE IF NOT EXISTS Domicilios (id integer,nocliente text not null, domentrega text);");
            builder.Append("CREATE INDEX idx_domicilios on Domicilios (id, nocliente);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        static void CreateTableCredentials(string _connectionString)
        {
            StringBuilder builder = new StringBuilder();
            builder.Append("DROP TABLE IF EXISTS Credentials;");
            builder.Append("CREATE TABLE IF NOT EXISTS Credentials (login text primary key, password text not null, fullname text, email text not null, perfil text);");
            builder.Append("CREATE INDEX idx_credentials on Credentials (login);");

            string steatment = builder.ToString();
            using (var cn = new SQLiteConnection(_connectionString))
            {
                using (var cmd = new SQLiteCommand(steatment, cn))
                {
                    cn.Open();
                    cmd.ExecuteNonQuery();
                    cn.Close();
                }
            }
        }

        internal static void InsertCredentials(string fileDatabase, string dataDirectory)
        {
            string credentials = Path.Combine(dataDirectory, string.Format("credentials.txt"));
            string preSteatment = "INSERT INTO Credentials (login, password, fullname, email, perfil) values(@login, @password, @fullname, @email, @perfil)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(credentials))
            {
                string[] lines = File.ReadAllLines(credentials);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@login", tokens[0]);
                                cmd.Parameters.AddWithValue("@password", tokens[1]);
                                cmd.Parameters.AddWithValue("@fullname", tokens[2]);
                                cmd.Parameters.AddWithValue("@email", tokens[3]);
                                cmd.Parameters.AddWithValue("@perfil", tokens[4]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertCarteras(string fileDatabase, string dataDirectory)
        {
            string carteras = Path.Combine(dataDirectory, string.Format("carteras.txt"));
            string preSteatment = "INSERT INTO Carteras (login, cartera) values(@login, @cartera)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(carteras))
            {
                string[] lines = File.ReadAllLines(carteras);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split(',');

                                cmd.Parameters.AddWithValue("@login", tokens[0]);
                                cmd.Parameters.AddWithValue("@cartera", tokens[1]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertClientes(string fileDatabase, string dataDirectory)
        {
            string clientes = Path.Combine(dataDirectory, string.Format("clientes.txt"));
            string preSteatment = "INSERT INTO Clientes (cartera, nocliente, nombre, rfc, domfiscal, telefono, credito) values(@cartera, @nocliente, @nombre, @rfc, @domfiscal, @telefono, @credito)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(clientes))
            {
                string[] lines = File.ReadAllLines(clientes);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@cartera", tokens[0]);
                                cmd.Parameters.AddWithValue("@nocliente", tokens[1]);
                                cmd.Parameters.AddWithValue("@nombre", tokens[2]);
                                cmd.Parameters.AddWithValue("@rfc", tokens[3]);
                                cmd.Parameters.AddWithValue("@domfiscal", tokens[4]);
                                cmd.Parameters.AddWithValue("@telefono", tokens[5]);
                                cmd.Parameters.AddWithValue("@credito", tokens[6]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertDomicilios(string fileDatabase, string dataDirectory)
        {
            string domicilios = Path.Combine(dataDirectory, string.Format("domicilios.txt"));
            string preSteatment = "INSERT INTO Domicilios (id,nocliente, domentrega) values(@id,@nocliente,@domentrega)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(domicilios))
            {
                string[] lines = File.ReadAllLines(domicilios);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@id", tokens[0]);
                                cmd.Parameters.AddWithValue("@nocliente", tokens[1]);
                                cmd.Parameters.AddWithValue("@domentrega", tokens[2]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertExistencias(string fileDatabase, string dataDirectory)
        {
            string existencias = Path.Combine(dataDirectory, string.Format("existencias.txt"));
            string preSteatment = "INSERT INTO Existencias (codigo, almacen, existencia) values(@codigo, @almacen, @existencia)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(existencias))
            {
                string[] lines = File.ReadAllLines(existencias);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@codigo", tokens[0]);
                                cmd.Parameters.AddWithValue("@almacen", tokens[1]);
                                cmd.Parameters.AddWithValue("@existencia", tokens[2]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertEquivalencias(string fileDatabase, string dataDirectory)
        {
            string equivalencias = Path.Combine(dataDirectory, string.Format("equivalencias.txt"));
            string preSteatment = "INSERT INTO Equivalencias (codigo, codigoequiv ) values(@codigo, @codigoequiv)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(equivalencias))
            {
                string[] lines = File.ReadAllLines(equivalencias);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@codigo", tokens[0]);
                                cmd.Parameters.AddWithValue("@codigoequiv", tokens[1]);
                                
                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }

        internal static void InsertProductos(string fileDatabase, string dataDirectory)
        {
            string productos = Path.Combine(dataDirectory, string.Format("productos.txt"));
            string preSteatment = "INSERT INTO Productos (codigo, descripcion, precio, unidad, linea) values(@codigo, @descripcion, @precio, @unidad, @linea)";
            string _connectionString = string.Format("Data Source = {0}", fileDatabase);

            if (File.Exists(productos))
            {
                string[] lines = File.ReadAllLines(productos);
                StringBuilder builder = new StringBuilder();

                using (var cn = new SQLiteConnection(_connectionString))
                {
                    cn.Open();
                    using (var transaction = cn.BeginTransaction())
                    {
                        using (var cmd = cn.CreateCommand())
                        {
                            cmd.CommandText = preSteatment;

                            foreach (var line in lines)
                            {
                                string[] tokens = line.Split('\t');

                                cmd.Parameters.AddWithValue("@codigo", tokens[0]);
                                cmd.Parameters.AddWithValue("@descripcion", tokens[1]);
                                cmd.Parameters.AddWithValue("@precio", tokens[2]);
                                cmd.Parameters.AddWithValue("@unidad", tokens[3]);
                                cmd.Parameters.AddWithValue("@linea", tokens[4]);

                                cmd.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
        }
    }
}
